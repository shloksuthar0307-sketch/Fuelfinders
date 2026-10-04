import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export const geocodeSearch = async (query: string): Promise<GeocodeResult[]> => {
  const response = await apiClient.get('/routing/geocode/', { params: { q: query } });
  return response.data;
};

export const getRoute = async (originLat: number, originLng: number, destLat: number, destLng: number) => {
  const response = await apiClient.get('/routing/route/', {
    params: {
      origin: `${originLat},${originLng}`,
      destination: `${destLat},${destLng}`
    }
  });
  return response.data;
};

export interface AlongRouteResponse {
  stations: (FuelStation & { distance_from_route?: number })[];
  route_geometry: [number, number][]; // [lng, lat] from GeoJSON
}

export const fetchStationsAlongRoute = async (origin: string, dest: string, tolerance: number = 5): Promise<AlongRouteResponse> => {
  const response = await apiClient.get<AlongRouteResponse>('/stations/along-route/', {
    params: {
      origin,
      destination: dest,
      tolerance
    }
  });
  return response.data;
};

export const fetchStation = async (id: string): Promise<FuelStation> => {
  const response = await apiClient.get<FuelStation>(`/stations/${id}/`);
  return response.data;
};

export const fetchStationPrices = async (id: string): Promise<FuelPrice[]> => {
  const response = await apiClient.get<FuelPrice[]>(`/stations/${id}/prices/`);
  return response.data;
};
