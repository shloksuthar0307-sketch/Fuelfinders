import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { geocodeSearch, fetchStationsAlongRoute } from '../lib/api';
import { addRouteToHistory } from '../lib/history';
import MapComponent from '../components/MapComponent';
import { Loader2, ArrowLeft, Fuel, Navigation, Clock } from 'lucide-react';
import { StationCard } from '../components/StationCard';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const originQuery = searchParams.get('origin');
  const destQuery = searchParams.get('dest');

  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeTime, setRouteTime] = useState<number | null>(null);
  
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');

  const [routeStations, setRouteStations] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('detour'); // detour, time

  const formatDistance = (meters: number) => (meters / 1000).toFixed(1) + ' km';
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // Geocode & Route
  useEffect(() => {
    const fetchRoute = async () => {
      if (!originQuery || !destQuery) return;
      setIsLoadingRoute(true);
      setRouteError('');
      
      try {
        let originLat, originLng;
        if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(originQuery)) {
          const parts = originQuery.split(',');
          originLat = parseFloat(parts[0]);
          originLng = parseFloat(parts[1]);
        } else {
          const originRes = await geocodeSearch(originQuery);
          if (!originRes.length) throw new Error("Origin location not found");
          originLat = parseFloat(originRes[0].lat);
          originLng = parseFloat(originRes[0].lon);
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

        const fuelsQuery = searchParams.get('fuels');
        const selectedFuels = fuelsQuery ? fuelsQuery.split(',') : [];

        const routeResponse = await fetchStationsAlongRoute(
          `${originLat},${originLng}`, 
          `${destLat},${destLng}`,
          selectedFuels,
          2.0 // 2km radius
        );
        
        const geometry = routeResponse.route_geometry.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
        setRouteGeometry(geometry);
        setRouteDistance(routeResponse.base_distance);
        setRouteTime(routeResponse.base_time);
        setRouteStations(routeResponse.stations || []);

        addRouteToHistory({
          origin: originQuery,
          destination: destQuery,
          fuels: selectedFuels,
          distance: routeResponse.base_distance,
          time: routeResponse.base_time,
        });

      } catch (err: any) {
        setRouteError(err.message || 'Failed to calculate route. Ensure you provided valid locations.');
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
      return (a.detour_distance || 0) - (b.detour_distance || 0);
    } else if (sortBy === 'time') {
      return (a.extra_time || 0) - (b.extra_time || 0);
    }
    return 0; 
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
        <div className="glass-card flex flex-col pointer-events-auto max-h-[60vh] md:max-h-full overflow-hidden shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-md">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-brand-secondary hover:text-brand-blue mb-3 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Search
            </Link>
            <h2 className="text-xl font-bold text-brand-navy leading-tight">Stations Along Route</h2>
            <div className="flex items-center text-xs text-brand-secondary mt-1">
              <span className="truncate max-w-[40%] font-semibold">{originQuery}</span>
              <span className="mx-2">&rarr;</span>
              <span className="truncate max-w-[40%] font-semibold">{destQuery}</span>
            </div>
            
            {!isLoadingRoute && !routeError && routeDistance !== null && (
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center text-sm font-medium text-slate-700">
                  <Navigation className="w-4 h-4 mr-1.5 text-blue-500" />
                  {formatDistance(routeDistance)}
                </div>
                <div className="flex items-center text-sm font-medium text-slate-700">
                  <Clock className="w-4 h-4 mr-1.5 text-emerald-500" />
                  {routeTime !== null ? formatTime(routeTime) : '--'}
                </div>
              </div>
            )}
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
                  className="bg-transparent text-brand-blue font-medium focus:outline-none cursor-pointer text-sm outline-none"
                >
                  <option value="detour">Shortest Detour</option>
                  <option value="time">Least Extra Time</option>
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
            
            {!isLoadingRoute && sortedStations.map((station, idx) => (
              <div key={station.id} className="relative">
                {idx === 0 && (
                  <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm border border-emerald-400">
                    BEST OPTION
                  </div>
                )}
                <StationCard 
                  station={station} 
                  onFavorite={(e) => { e.preventDefault(); }} 
                />
                <div className="mt-2 bg-slate-50 rounded-lg p-3 text-sm flex justify-between items-center border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-600 font-medium">+{((station.detour_distance || 0)).toFixed(1)} km detour</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>+{station.extra_time || 0} min</span>
                  </div>
                </div>
              </div>
            ))}

            {!isLoadingRoute && !routeError && routeStations.length === 0 && (
              <div className="text-center py-10 text-brand-secondary">
                <Fuel className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No stations found within 2 km of your route.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
