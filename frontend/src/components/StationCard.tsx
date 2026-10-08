import { Link } from 'react-router-dom';
import { Heart, Navigation, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { Button } from './ui/Button';
import { useFavorites } from '../hooks/useFavorites';

export interface StationData {
  id: string | number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  supported_fuels: string[];
  distance_from_route?: number;
  is_verified?: boolean;
  prices?: { fuel_type: string, price: string, currency: string, unit: string }[];
}

interface StationCardProps {
  station: StationData;
  onFavorite?: (e: React.MouseEvent) => void;
}

export const StationCard = ({ station, onFavorite }: StationCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(station.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(station);
    if (onFavorite) onFavorite(e);
  };

  return (
    <Link 
      to={`/station/${station.id}`} 
      className="block bg-white p-4 rounded-xl border border-gray-100 hover:border-brand-blue/30 hover:shadow-lg transition-all group"
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2 max-w-[85%]">
          <h3 className="font-bold text-base text-brand-navy group-hover:text-brand-blue transition-colors truncate">{station.name}</h3>
          {station.is_verified && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className={clsx("h-8 w-8 -mr-2 -mt-2 transition-colors", isFav ? "text-red-500 hover:text-red-600" : "text-gray-300 hover:text-red-400")}
          onClick={handleFavoriteClick}
        >
          <Heart className="h-5 w-5" fill={isFav ? "currentColor" : "none"} />
        </Button>
      </div>
      
      <p className="text-xs text-brand-secondary mb-2 truncate">{station.address || `${station.city}, ${station.state}`}</p>
      
      {station.prices && station.prices.length > 0 && (
        <div className="mb-3 text-xs bg-gray-50 border border-gray-100 rounded px-2 py-1 flex flex-wrap gap-x-3 gap-y-1">
          {station.prices.map((p, i) => (
            <span key={i} className="font-medium text-gray-700">
              {p.fuel_type}: {p.price} {p.currency}/{p.unit}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-end">
        <div className="flex flex-wrap gap-1.5">
          {station.supported_fuels.map((f: string) => (
            <span key={f} className={clsx(
              "px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider",
              f.toLowerCase() === 'petrol' ? "bg-orange-100 text-orange-700" :
              f.toLowerCase() === 'diesel' ? "bg-gray-100 text-gray-700" :
              f.toLowerCase() === 'cng' ? "bg-green-100 text-green-700" :
              "bg-blue-100 text-blue-700"
            )}>
              {f}
            </span>
          ))}
        </div>

        {station.distance_from_route !== undefined && (
          <div className="flex items-center text-xs font-semibold text-brand-success bg-green-50 px-2 py-1 rounded-md">
            <Navigation className="h-3 w-3 mr-1" />
            {Number(station.distance_from_route).toFixed(1)} km from route
          </div>
        )}
      </div>
    </Link>
  );
};
