import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCityStations } from '../lib/api';
import MapComponent from '../components/MapComponent';
import { Loader2, ArrowLeft, Fuel, ChevronLeft, ChevronRight } from 'lucide-react';
import { StationCard } from '../components/StationCard';

const CityStations = () => {
  const { cityName } = useParams<{ cityName: string }>();
  
  const [cityStations, setCityStations] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    const loadCityStations = async () => {
      if (!cityName) return;
      setIsLoading(true);
      setError('');
      
      try {
        const response = await fetchCityStations(cityName);
        setCityStations(response.stations || []);
        if (response.center) {
          setMapCenter([response.center[0], response.center[1]]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch stations for this city.');
      } finally {
        setIsLoading(false);
        setCurrentPage(1);
      }
    };

    loadCityStations();
  }, [cityName]);

  return (
    <div className="flex-1 flex flex-col md:flex-row relative h-[calc(100vh-4rem)]">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
         <MapComponent 
            stations={cityStations} 
            center={mapCenter} 
            zoom={12} 
            routeGeometry={[]}
         />
      </div>

      {/* Floating Results Panel */}
      <div className="relative z-10 w-full md:w-[420px] md:h-full pointer-events-none p-3 sm:p-6 flex flex-col justify-end md:justify-start">
        <div className="glass-card flex flex-col pointer-events-auto max-h-[60vh] md:max-h-full overflow-hidden shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-md">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-brand-secondary hover:text-brand-blue mb-3 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <h2 className="text-xl font-bold text-brand-navy leading-tight">Stations in {cityName}</h2>
          </div>
          
          {/* Controls */}
          {!isLoading && !error && cityStations.length > 0 && (
            <div className="px-4 py-3 bg-white/40 border-b border-gray-100 flex justify-between items-center backdrop-blur-md">
              <span className="text-sm font-semibold text-brand-navy">{cityStations.length} stations found</span>
            </div>
          )}

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-40 text-brand-blue">
                <Loader2 className="animate-spin h-8 w-8 mb-4" />
                <span className="font-medium text-sm">Loading stations...</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-brand-danger p-4 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            {!isLoading && cityStations.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((station) => (
              <div key={station.id} className="relative">
                <StationCard 
                  station={station} 
                  onFavorite={(e) => { e.preventDefault(); }} 
                />
              </div>
            ))}

            {!isLoading && !error && cityStations.length > ITEMS_PER_PAGE && (
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-brand-navy"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-brand-secondary">
                  Page {currentPage} of {Math.ceil(cityStations.length / ITEMS_PER_PAGE)}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(cityStations.length / ITEMS_PER_PAGE), p + 1))}
                  disabled={currentPage === Math.ceil(cityStations.length / ITEMS_PER_PAGE)}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-brand-navy"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {!isLoading && !error && cityStations.length === 0 && (
              <div className="text-center py-10 text-brand-secondary">
                <Fuel className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No stations found in {cityName}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityStations;
