import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchStation, fetchStationPrices } from '../lib/api';
import MapComponent from '../components/MapComponent';
import { MapPin, Phone, Clock, Navigation, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const StationDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: station, isLoading: isStationLoading } = useQuery({
    queryKey: ['station', id],
    queryFn: () => fetchStation(id!),
    enabled: !!id,
  });

  const { data: prices, isLoading: isPricesLoading } = useQuery({
    queryKey: ['station', id, 'prices'],
    queryFn: () => fetchStationPrices(id!),
    enabled: !!id,
  });

  if (isStationLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (!station) {
    return <div className="p-8 text-center text-red-500">Station not found.</div>;
  }

  const navigateToMaps = () => {
    // Open Google Maps Directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{station.name}</h1>
                <p className="text-gray-500 mt-1">{station.city}, {station.state}</p>
              </div>
              {station.is_verified ? (
                <span className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                </span>
              ) : (
                <span className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                  <XCircle className="h-4 w-4 mr-1" /> Unverified
                </span>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-start text-gray-700">
                <MapPin className="h-5 w-5 mr-3 text-blue-500 mt-0.5" />
                <span>{station.address || 'Address not available'}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="h-5 w-5 mr-3 text-blue-500" />
                <span>{station.phone || 'Phone not available'}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-3 text-blue-500" />
                <span>{station.opening_hours || 'Hours not verified'}</span>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button 
                onClick={navigateToMaps}
                className="flex-1 flex justify-center items-center py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold"
              >
                <Navigation className="h-5 w-5 mr-2" />
                Navigate
              </button>
              <button className="flex-1 flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold">
                Report Issue
              </button>
            </div>
          </div>

          {/* Fuel Prices Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Current Fuel Prices</h2>
            {isPricesLoading ? (
              <Loader2 className="animate-spin h-5 w-5 text-gray-400" />
            ) : prices && prices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {prices.map(price => (
                  <div key={price.id} className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500 uppercase font-semibold">{price.fuel_type}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {price.price} {price.currency} <span className="text-sm font-normal text-gray-500">/{price.unit}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Verified: {new Date(price.verified_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No verified prices available for this station.</p>
            )}
          </div>
        </div>

        {/* Sidebar Map */}
        <div className="h-[400px] lg:h-auto rounded-xl overflow-hidden shadow-sm border relative">
          <MapComponent 
            stations={[station]} 
            center={[station.latitude, station.longitude]} 
            zoom={15} 
          />
        </div>

      </div>
    </div>
  );
};

export default StationDetails;
