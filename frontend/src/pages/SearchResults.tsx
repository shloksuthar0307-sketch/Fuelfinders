import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { geocodeSearch, fetchStationsAlongRoute, fetchStations } from '../lib/api';
import MapComponent from '../components/MapComponent';
import { Loader2, ArrowLeft, Fuel } from 'lucide-react';
import { StationCard } from '../components/StationCard';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const originQuery = searchParams.get('origin');
  const destQuery = searchParams.get('dest');

  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');

  const [routeStations, setRouteStations] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('detour'); // detour, nearest

  // Geocode & Route
  useEffect(() => {
    const fetchRoute = async () => {
      if (!originQuery) return;
      setIsLoadingRoute(true);
      setRouteError('');
      
      try {
        let originLat, originLng;
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
          if (!originRes.length) throw new Error("Location not found");
          originLat = parseFloat(originRes[0].lat);
          originLng = parseFloat(originRes[0].lon);
        }

        if (!destQuery) {
          setRouteGeometry([[originLat, originLng]]);
          const allStations = await fetchStations();
          
          const deg2rad = (deg: number) => deg * (Math.PI/180);
          const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const dLat = deg2rad(lat2 - lat1);
            const dLon = deg2rad(lon2 - lon1);
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
                      Math.sin(dLon/2) * Math.sin(dLon/2); 
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            return 6371 * c; 
          };
          
          const matchCity = allStations.filter(s => s.city.toLowerCase().includes(originQuery.toLowerCase()) || originQuery.toLowerCase().includes(s.city.toLowerCase()));
          
          if (matchCity.length > 0) {
            setRouteStations(matchCity.map(s => ({...s, distance_from_route: getDistance(originLat, originLng, s.latitude, s.longitude)})));
          } else {
            const near = allStations.filter(s => getDistance(originLat, originLng, s.latitude, s.longitude) <= 50);
            setRouteStations(near.map(s => ({...s, distance_from_route: getDistance(originLat, originLng, s.latitude, s.longitude)})));
          }
          
          setIsLoadingRoute(false);
          return;
        }

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

        const routeResponse = await fetchStationsAlongRoute(
          `${originLat},${originLng}`, 
          `${destLat},${destLng}`
        );
        
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

  let mapCenter: [number, number] = [20.5937, 78.9629];
  if (routeGeometry.length > 0) {
    mapCenter = routeGeometry[Math.floor(routeGeometry.length / 2)];
  } else if (routeStations.length > 0) {
    mapCenter = [routeStations[0].latitude, routeStations[0].longitude];
  }

  const sortedStations = [...routeStations].sort((a, b) => {
    if (sortBy === 'detour') {
      return (a.distance_from_route || 0) - (b.distance_from_route || 0);
    }
    return 0; // Default or other sorting logic
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row relative h-[calc(100vh-4rem)]">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
         <MapComponent 
            stations={routeStations} 
            center={mapCenter} 
            zoom={routeGeometry.length > 0 ? 8 : 11} 
            routeGeometry={routeGeometry}
         />
      </div>

      {/* Floating Results Panel */}
      <div className="relative z-10 w-full md:w-[420px] md:h-full pointer-events-none p-3 sm:p-6 flex flex-col justify-end md:justify-start">
        <div className="glass-card flex flex-col pointer-events-auto max-h-[60vh] md:max-h-full overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-md">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-brand-secondary hover:text-brand-blue mb-3 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Search
            </Link>
            <h2 className="text-xl font-bold text-brand-navy leading-tight">Stations Along Route</h2>
            <div className="flex items-center text-xs text-brand-secondary mt-1">
              <span className="truncate max-w-[40%]">{originQuery === 'Current Location' ? 'My Location' : originQuery}</span>
              <span className="mx-2">&rarr;</span>
              <span className="truncate max-w-[40%]">{destQuery}</span>
            </div>
          </div>
          
          {/* Controls */}
          {!isLoadingRoute && !routeError && routeStations.length > 0 && (
            <div className="px-4 py-3 bg-white/40 border-b border-gray-100 flex justify-between items-center backdrop-blur-md">
              <span className="text-sm font-semibold text-brand-navy">{routeStations.length} stations found</span>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-brand-secondary text-xs">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-brand-blue font-medium focus:outline-none cursor-pointer text-sm"
                >
                  <option value="detour">Shortest Detour</option>
                  <option value="nearest">Nearest to Origin</option>
                </select>
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoadingRoute && (
              <div className="flex flex-col items-center justify-center h-40 text-brand-blue">
                <Loader2 className="animate-spin h-8 w-8 mb-4" />
                <span className="font-medium text-sm">Calculating optimal route...</span>
              </div>
            )}
            
            {routeError && (
              <div className="bg-red-50 text-brand-danger p-4 rounded-xl text-sm font-medium border border-red-100">
                {routeError}
              </div>
            )}
            
            {!isLoadingRoute && sortedStations.map((station) => (
              <StationCard 
                key={station.id} 
                station={station} 
                onFavorite={(e) => { e.preventDefault(); /* Add favorite */ }} 
              />
            ))}

            {!isLoadingRoute && !routeError && routeStations.length === 0 && (
              <div className="text-center py-10 text-brand-secondary">
                <Fuel className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No stations found along this route.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
