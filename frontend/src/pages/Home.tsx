import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation2, Loader2 } from 'lucide-react';
import MapComponent from '../components/MapComponent';

const FUEL_TYPES = [
  { id: 'petrol', label: 'Petrol' },
  { id: 'diesel', label: 'Diesel' },
  { id: 'cng', label: 'CNG' },
];

const Home = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedFuels, setSelectedFuels] = useState<string[]>(['petrol']);
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center default

  const toggleFuel = (fuelId: string) => {
    setSelectedFuels((prev) =>
      prev.includes(fuelId) ? prev.filter((f) => f !== fuelId) : [...prev, fuelId]
    );
  };

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
          setMapCenter([lat, lng]);
          setOrigin('Current Location'); // In a real app we'd reverse-geocode this
          setIsLocating(false);
        },
        (error) => {
          console.error("Error obtaining location", error);
          alert("Could not get your location. Please ensure you have given permission.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination && selectedFuels.length > 0) {
      // If we used geolocation, pass the coordinates instead of the string "Current Location"
      const originParam = (origin === 'Current Location' && userLocation) 
        ? `${userLocation[0]},${userLocation[1]}` 
        : origin;
        
      navigate(`/search?origin=${encodeURIComponent(originParam)}&dest=${encodeURIComponent(destination)}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row relative">
      {/* Search Panel */}
      <div className="w-full md:w-96 bg-white p-6 shadow-xl z-10 flex flex-col h-full md:h-[calc(100vh-4rem)]">
        <h1 className="text-2xl font-bold mb-6">Find Fuel Stations</h1>
        
        <form onSubmit={handleSearch} className="space-y-6 flex-1">
          {/* Origin Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Origin</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Navigation2 className="h-5 w-5 text-blue-500" />
              </div>
              <input
                type="text"
                placeholder="Current Location or Address"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>
            <button 
              type="button" 
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="text-sm text-blue-600 hover:underline flex items-center disabled:opacity-50"
            >
              {isLocating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <MapPin className="h-4 w-4 mr-1" />}
              Use My Current Location
            </button>
          </div>

          {/* Destination Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Destination</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-red-500" />
              </div>
              <input
                type="text"
                placeholder="Where are you going?"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>

          {/* Fuel Types */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Fuel Type (select multiple)</label>
            <div className="flex flex-wrap gap-2">
              {FUEL_TYPES.map((fuel) => (
                <button
                  key={fuel.id}
                  type="button"
                  onClick={() => toggleFuel(fuel.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedFuels.includes(fuel.id)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {fuel.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold text-lg"
              disabled={!origin || !destination || selectedFuels.length === 0}
            >
              <Search className="h-5 w-5 mr-2" />
              Find Route & Stations
            </button>
          </div>
        </form>
      </div>

      {/* Map Area */}
      <div className="flex-1 bg-blue-50 relative min-h-[400px]">
        <MapComponent center={mapCenter} userLocation={userLocation} zoom={userLocation ? 13 : 5} />
      </div>
    </div>
  );
};

export default Home;
