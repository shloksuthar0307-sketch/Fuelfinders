import React, { useState, useEffect, useRef } from 'react';
import { geocodeSearch } from '../../lib/api';
import type { GeocodeResult } from '../../lib/api';
import { Input } from './Input';
import type { InputProps } from './Input';
import { Loader2, MapPin } from 'lucide-react';

interface LocationAutocompleteProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (result: GeocodeResult) => void;
  debounceMs?: number;
}

export const LocationAutocomplete = ({ 
  value, 
  onChange, 
  onLocationSelect, 
  debounceMs = 400,
  ...props 
}: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!value || value.length < 3 || value === 'Current Location') {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      // Avoid searching if the user just clicked a suggestion which precisely matches
      if (!isOpen) return;

      setIsLoading(true);
      try {
        const results = await geocodeSearch(value);
        setSuggestions(results);
      } catch (error) {
        console.error("Failed to fetch suggestions", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, isOpen]);

  const handleSelect = (result: GeocodeResult) => {
    onChange(result.display_name);
    if (onLocationSelect) {
      onLocationSelect(result);
    }
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <Input
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        {...props}
      />
      {isLoading && (
        <div className="absolute right-3 top-3.5 z-10">
          <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
        </div>
      )}
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start border-b border-gray-50 last:border-0 transition-colors"
              onClick={() => handleSelect(suggestion)}
            >
              <MapPin className="h-4 w-4 text-brand-secondary mt-0.5 mr-2 shrink-0" />
              <span className="text-sm text-brand-navy truncate">
                {suggestion.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
