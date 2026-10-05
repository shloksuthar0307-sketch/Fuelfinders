import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchStation, fetchStationPrices } from '../lib/api';
import MapComponent from '../components/MapComponent';
import { MapPin, Phone, Clock, Navigation, CheckCircle2, XCircle, Loader2, Star, Share2 } from 'lucide-react';
import { FuelPriceCard } from '../components/FuelPriceCard';
import { Button } from '../components/ui/Button';

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
      <div className="flex-1 flex flex-col items-center justify-center text-brand-blue">
        <Loader2 className="animate-spin h-10 w-10 mb-4" />
        <span className="font-medium text-sm">Loading station details...</span>
      </div>
    );
  }

  if (!station) {
    return <div className="p-8 text-center text-brand-danger font-medium">Station not found.</div>;
  }

  const navigateToMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 w-full fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-brand-navy tracking-tight">{station.name}</h1>
                <p className="text-brand-secondary mt-1 font-medium">{station.city}, {station.state}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" title="Save to Favorites">
                  <Star className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" title="Share">
                  <Share2 className="h-5 w-5" />
                </Button>
                {station.is_verified ? (
                  <span className="flex items-center text-brand-success bg-green-50 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center text-brand-secondary bg-gray-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-200">
                    <XCircle className="h-4 w-4 mr-1.5" /> Unverified
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <div className="flex items-start text-brand-navy">
                <div className="bg-blue-50 p-2 rounded-lg mr-4">
                  <MapPin className="h-5 w-5 text-brand-blue" />
                </div>
                <div className="mt-1">
                  <p className="text-sm text-brand-secondary font-medium mb-0.5">Address</p>
                  <p className="font-medium">{station.address || 'Address not available'}</p>
                </div>
              </div>
              <div className="flex items-start text-brand-navy">
                <div className="bg-blue-50 p-2 rounded-lg mr-4">
                  <Phone className="h-5 w-5 text-brand-blue" />
                </div>
                <div className="mt-1">
                  <p className="text-sm text-brand-secondary font-medium mb-0.5">Contact</p>
                  <p className="font-medium">{station.phone || 'Phone not available'}</p>
                </div>
              </div>
              <div className="flex items-start text-brand-navy">
                <div className="bg-blue-50 p-2 rounded-lg mr-4">
                  <Clock className="h-5 w-5 text-brand-blue" />
                </div>
                <div className="mt-1">
                  <p className="text-sm text-brand-secondary font-medium mb-0.5">Hours</p>
                  <p className="font-medium">{station.opening_hours || 'Hours not verified'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Button 
                onClick={navigateToMaps}
                size="lg"
                className="flex-1"
              >
                <Navigation className="h-5 w-5 mr-2" />
                Navigate
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                Report Issue
              </Button>
            </div>
          </div>

          {/* Fuel Prices Section */}
          <div className="glass-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-6 text-brand-navy">Current Fuel Prices</h2>
            {isPricesLoading ? (
              <Loader2 className="animate-spin h-6 w-6 text-brand-blue" />
            ) : prices && prices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {prices.map(price => (
                  <FuelPriceCard key={price.id} priceData={price} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <p className="text-brand-secondary font-medium">No verified prices available for this station.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Map */}
        <div className="h-[400px] lg:h-[calc(100vh-10rem)] lg:sticky lg:top-24 rounded-2xl overflow-hidden shadow-lg border border-gray-100 z-0">
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
