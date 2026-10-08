import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling
    if (error.response) {
      console.error(`API Error [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      console.error('API Error: No response received from server.');
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export interface FuelPrice {
  id: number;
  fuel_type: string;
  price: string;
  unit: string;
  currency: string;
  source: string;
  verified_at: string;
}

export interface FuelStation {
  id: string | number;
  db_id?: number;
  external_source_id?: string | null;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  supported_fuels: string[];
  phone: string;
  opening_hours: string;
  is_verified: boolean;
  source?: 'manual' | 'geoapify';
  prices?: FuelPrice[];
}

export const fetchStations = async (): Promise<FuelStation[]> => {
  const response = await apiClient.get('/stations/');
  return response.data;
};

// Admin Auth
export const login = async (username: string, password: string): Promise<string> => {
  const response = await apiClient.post('/auth/login/', { username, password });
  return response.data.token;
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
    localStorage.setItem('adminToken', token);
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('adminToken');
  }
};

// Initialize token from storage
const initialToken = localStorage.getItem('adminToken');
if (initialToken) {
  setAuthToken(initialToken);
}

// Admin APIs
export const createStation = async (data: Partial<FuelStation>): Promise<FuelStation> => {
  const response = await apiClient.post('/stations/', data);
  return response.data;
};

export const updateStation = async (id: number, data: Partial<FuelStation>): Promise<FuelStation> => {
  const response = await apiClient.patch(`/stations/${id}/`, data);
  return response.data;
};

export const deleteStation = async (id: number): Promise<void> => {
  await apiClient.delete(`/stations/${id}/`);
};

export const createPrice = async (stationId: number, data: Partial<FuelPrice>): Promise<FuelPrice> => {
  const response = await apiClient.post(`/stations/${stationId}/prices/`, data);
  return response.data;
};

export const updatePrice = async (id: number, data: Partial<FuelPrice>): Promise<FuelPrice> => {
  const response = await apiClient.patch(`/stations/prices/${id}/`, data);
  return response.data;
};

export const deletePrice = async (id: number): Promise<void> => {
  await apiClient.delete(`/stations/prices/${id}/`);
};

export const importGeoapify = async (city: string): Promise<{ added: number, updated: number }> => {
  const response = await apiClient.post('/stations/import-geoapify/', { city });
  return response.data;
};

export interface GeocodeResult {
  place_id: number | string;
  lat: string;
  lon: string;
  display_name: string;
}

export const geocodeSearch = async (query: string): Promise<GeocodeResult[]> => {
  if (!query || query.trim() === '') {
    return [];
  }

  try {
    const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
    if (!GEOAPIFY_API_KEY) {
      console.error("Geocoding Error: Missing Geoapify API key");
      return [];
    }

    const geoapifyUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=countrycode:in&limit=5&apiKey=${GEOAPIFY_API_KEY}`;
    
    // Concurrently fetch from Geoapify and our Local DB
    const [geoapifyRes, localRes] = await Promise.allSettled([
      axios.get(geoapifyUrl),
      apiClient.get(`/stations/?q=${encodeURIComponent(query)}`)
    ]);

    const results: GeocodeResult[] = [];

    // 1. Process local DB stations
    if (localRes.status === 'fulfilled' && localRes.value.data) {
      const stations = localRes.value.data;
      stations.slice(0, 3).forEach((station: any) => {
        results.push({
          place_id: `db_${station.id}`,
          lat: String(station.latitude),
          lon: String(station.longitude),
          display_name: `🏪 ${station.name}, ${station.city}`
        });
      });
    }

    // 2. Process Geoapify locations
    if (geoapifyRes.status === 'fulfilled' && geoapifyRes.value.data?.features) {
      geoapifyRes.value.data.features.forEach((feature: any) => {
        results.push({
          place_id: feature.properties.place_id || Math.random().toString(),
          lat: String(feature.properties.lat),
          lon: String(feature.properties.lon),
          display_name: feature.properties.formatted || feature.properties.name
        });
      });
    }

    return results;
  } catch (error: any) {
    console.error("Geocoding Error: Network or API error", error.message || error);
    return [];
  }
};

export const autocompleteSearch = async (query: string): Promise<GeocodeResult[]> => {
  try {
    const response = await apiClient.get('/routing/autocomplete/', { params: { q: query } });
    return response.data;
  } catch (error) {
    console.error("Autocomplete Error:", error);
    return [];
  }
};

export const reverseGeocode = async (lat: number, lon: number): Promise<GeocodeResult | null> => {
  try {
    const response = await apiClient.get('/routing/reverse-geocode/', { params: { lat, lon } });
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }
    return null;
  } catch (error) {
    console.error("Reverse Geocoding Error:", error);
    return null;
  }
};

export const getRoute = async (originLat: number, originLng: number, destLat: number, destLng: number) => {
  const response = await apiClient.post('/routing/route/', {
    origin: `${originLat},${originLng}`,
    destination: `${destLat},${destLng}`
  });
  return response.data;
};

export interface RouteStation extends FuelStation {
  distance_from_route?: number;
  detour_distance?: number;
  extra_time?: number;
}

export interface AlongRouteResponse {
  stations: RouteStation[];
  route_geometry: [number, number][]; // [lon, lat]
  base_distance: number;
  base_time: number;
  total_items?: number;
  current_page?: number;
}

export const fetchStationsAlongRoute = async (
  origin: string, 
  dest: string, 
  fuels: string[] = [], 
  tolerance: number = 2,
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'detour'
): Promise<AlongRouteResponse> => {
  const response = await apiClient.post<AlongRouteResponse>('/routing/route-stations/', {
    origin,
    destination: dest,
    fuels,
    tolerance,
    page,
    limit,
    sortBy
  });
  return response.data;
};

export const fetchStation = async (id: string): Promise<FuelStation> => {
  const response = await apiClient.get<FuelStation>(`/routing/station/${id}/`);
  return response.data;
};

export const fetchStationPrices = async (id: string): Promise<FuelPrice[]> => {
  const response = await apiClient.get<FuelPrice[]>(`/routing/station/${id}/prices/`);
  return response.data;
};

export interface CityStationsResponse {
  city: string;
  center: [number, number];
  stations: FuelStation[];
}

export const fetchCityStations = async (city: string): Promise<CityStationsResponse> => {
  const response = await apiClient.get<CityStationsResponse>(`/routing/city-stations/`, { params: { city } });
  return response.data;
};
