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
  id: number;
  external_source_id: string | null;
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
  prices: FuelPrice[];
}

export const fetchStations = async (): Promise<FuelStation[]> => {
  const response = await apiClient.get('/stations/');
  return response.data;
};

export interface GeocodeResult {
  place_id: number | string;
  lat: string;
  lon: string;
  display_name: string;
}

export const geocodeSearch = async (query: string): Promise<GeocodeResult[]> => {
  try {
    const response = await apiClient.get('/routing/geocode/', { params: { q: query } });
    return response.data;
  } catch (error) {
    console.error("Geocoding Error:", error);
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
}

export const fetchStationsAlongRoute = async (origin: string, dest: string, fuels: string[] = [], tolerance: number = 2): Promise<AlongRouteResponse> => {
  const response = await apiClient.post<AlongRouteResponse>('/routing/route-stations/', {
    origin,
    destination: dest,
    fuels,
    tolerance
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
