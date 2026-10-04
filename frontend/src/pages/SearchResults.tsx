import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { geocodeSearch, fetchStationsAlongRoute } from '../lib/api';
import MapComponent from '../components/MapComponent';
import { Loader2 } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const originQuery = searchParams.get('origin');
  const destQuery = searchParams.get('dest');

  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');

  const [routeStations, setRouteStations] = useState<any[]>([]);

  // 2. Geocode & Route
  useEffect(() => {
    const fetchRoute = async () => {
      if (!originQuery || !destQuery) return;
      setIsLoadingRoute(true);
      setRouteError('');
      
      try {
        // Geocode origin
        let originLat, originLng;
        // Check if origin is already in 'lat,lng' format
        if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(originQuery)) {
          const parts = originQuery.split(',');
          originLat = parseFloat(parts[0]);
          originLng = parseFloat(parts[1]);
        } else if (originQuery === 'Current Location') {
          setRouteError("Origin 'Current Location' requires exact coordinates to be passed.");
          setIsLoadingRoute(false);
          return;
        } else {
          const originRes = await geocodeSearch(originQuery);
          if (!originRes.length) throw new Error("Origin not found");
          originLat = parseFloat(originRes[0].lat);
          originLng = parseFloat(originRes[0].lon);
        }

        // Geocode destination
        let destLat, destLng;
        if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(destQuery)) {
          const parts = destQuery.split(',');
          destLat = parseFloat(parts[0]);
          destLng = parseFloat(parts[1]);
        } else {
          const destRes = await geocodeSearch(destQuery);
          if (!destRes.length) throw new Error("Destination not found");
          destLat = parseFloat(destRes[0].lat);
          destLng = parseFloat(destRes[0].lon);
        }

        // Get Route and Stations
        const routeResponse = await fetchStationsAlongRoute(
          `${originLat},${originLng}`, 
          `${destLat},${destLng}`
        );
        
        // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
        const geometry = routeResponse.route_geometry.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
        setRouteGeometry(geometry);
        setRouteStations(routeResponse.stations);

      } catch (err: any) {
        setRouteError(err.message || 'Failed to calculate route');
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [originQuery, destQuery]);

  // Map Center
  let mapCenter: [number, number] = [20.5937, 78.9629];
  if (routeGeometry.length > 0) {
    mapCenter = routeGeometry[Math.floor(routeGeometry.length / 2)];
  } else if (routeStations.length > 0) {
    mapCenter = [routeStations[0].latitude, routeStations[0].longitude];
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row relative">
      <div className="w-full md:w-96 bg-white border-r flex flex-col h-[calc(100vh-4rem)] overflow-hidden z-10">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Stations Along Route</h2>
          <p className="text-sm text-gray-500">
            {originQuery} &rarr; {destQuery}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoadingRoute && (
            <div className="flex flex-col items-center justify-center p-8 text-blue-600">
              <Loader2 className="animate-spin h-8 w-8 mb-4" />
              <span>Calculating route & finding stations...</span>
            </div>
          )}
          {routeError && <p className="text-red-500">{routeError}</p>}
          
          {!isLoadingRoute && routeStations.map((station) => (
            <Link 
              to={`/station/${station.id}`} 
              key={station.id} 
              className="block p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-900">{station.name}</h3>
                {station.distance_from_route !== undefined && (
                  <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">
                    {station.distance_from_route} km detour
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{station.city}, {station.state}</p>
              <div className="flex gap-2">
                {station.supported_fuels.map((f: string) => (
                  <span key={f} className="px-2 py-1 bg-gray-100 text-xs rounded-md uppercase">
                    {f}
                  </span>
                ))}
              </div>
            </Link>
          ))}
          {!isLoadingRoute && !routeError && routeStations.length === 0 && (
            <p>No stations found along this route.</p>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-100 relative min-h-[400px]">
         <MapComponent 
            stations={routeStations} 
            center={mapCenter} 
            zoom={routeGeometry.length > 0 ? 8 : 11} 
            routeGeometry={routeGeometry}
         />
      </div>
    </div>
  );
};

export default SearchResults;
