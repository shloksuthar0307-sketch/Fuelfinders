import React from 'react';
import { Search, MapPin, Navigation2, Loader2, ArrowUpDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { LocationAutocomplete } from './ui/LocationAutocomplete';
import { Button } from './ui/Button';
import { FuelSelector } from './FuelSelector';

interface SearchSidebarProps {
  origin: string;
  setOrigin: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  selectedFuels: string[];
  setSelectedFuels: (fuels: string[]) => void;
  onSearch: (e: React.FormEvent) => void;
  onSwap: () => void;
  onGetCurrentLocation: () => void;
  isLocating: boolean;
  className?: string;
  cardClassName?: string;
}

export const SearchSidebar = ({
  origin,
  setOrigin,
  destination,
  setDestination,
  selectedFuels,
  setSelectedFuels,
  onSearch,
  onSwap,
  onGetCurrentLocation,
  isLocating,
  className,
  cardClassName
}: SearchSidebarProps) => {
  return (
    <div className={className || "relative z-10 w-full md:w-[400px] md:h-full pointer-events-none p-3 sm:p-6 flex flex-col justify-end md:justify-start"}>
      <Card className={cardClassName || "flex flex-col pointer-events-auto max-h-[60vh] md:max-h-full overflow-y-auto shadow-2xl"}>
        <CardHeader className="pb-4">
          <CardTitle>Find Fuel Stations</CardTitle>
          <CardDescription>Plan smarter. Refuel anywhere.</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={onSearch} className="space-y-5">
            <div className="flex flex-col relative gap-3">
              {/* Origin Input */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">Origin</label>
                <LocationAutocomplete
                  placeholder="Current location or address"
                  value={origin}
                  onChange={setOrigin}
                  icon={<Navigation2 className="h-5 w-5 text-brand-blue" />}
                />
              </div>

              {/* Destination Input */}
              <div className="space-y-2 mt-5">
                <label className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">Destination</label>
                <LocationAutocomplete
                  placeholder="Where are you going?"
                  value={destination}
                  onChange={setDestination}
                  icon={<MapPin className="h-5 w-5 text-brand-danger" />}
                />
              </div>

              {/* Swap Button */}
              <button 
                type="button"
                className="absolute z-10 top-1/2 -translate-y-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 p-2.5 rounded-full shadow-sm hover:shadow-md cursor-pointer text-brand-secondary hover:text-brand-blue transition-all flex items-center justify-center" 
                onClick={onSwap}
                title="Swap locations"
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>

            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="ghost"
                size="sm"
                onClick={onGetCurrentLocation}
                disabled={isLocating}
                className="text-xs text-brand-blue hover:text-blue-700 p-0 h-auto font-medium"
              >
                {isLocating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <MapPin className="h-3 w-3 mr-1" />}
                Use My Current Location
              </Button>
            </div>

            <FuelSelector selectedFuels={selectedFuels} onChange={setSelectedFuels} />

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!origin || !destination || selectedFuels.length === 0}
              >
                <Search className="h-5 w-5 mr-2" />
                Find Route & Stations
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
