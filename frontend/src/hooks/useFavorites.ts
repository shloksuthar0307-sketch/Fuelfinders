import { useState, useEffect } from 'react';
import type { StationData } from '../components/StationCard';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<StationData[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('cngwala_favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  const toggleFavorite = (station: StationData) => {
    setFavorites(prev => {
      const isFav = prev.some(s => s.id === station.id);
      let newFavs;
      if (isFav) {
        newFavs = prev.filter(s => s.id !== station.id);
      } else {
        newFavs = [...prev, station];
      }
      localStorage.setItem('cngwala_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const isFavorite = (id: string | number) => {
    return favorites.some(s => s.id === id);
  };

  return { favorites, toggleFavorite, isFavorite };
};
