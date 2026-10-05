import { Link } from 'react-router-dom';
import { Heart, Navigation } from 'lucide-react';
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
        <h3 className="font-bold text-base text-brand-navy group-hover:text-brand-blue transition-colors">{station.name}</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className={clsx("h-8 w-8 -mr-2 -mt-2 transition-colors", isFav ? "text-red-500 hover:text-red-600" : "text-gray-300 hover:text-red-400")}
          onClick={handleFavoriteClick}
        >
          <Heart className="h-5 w-5" fill={isFav ? "currentColor" : "none"} />
        </Button>
      </div>
      
      <p className="text-xs text-brand-secondary mb-3 truncate">{station.address || `${station.city}, ${station.state}`}</p>
      
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
