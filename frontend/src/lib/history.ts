export interface RouteHistoryItem {
  id: string;
  origin: string;
  destination: string;
  fuels: string[];
  timestamp: number;
  distance?: number;
  time?: number;
}

const HISTORY_KEY = 'cngwala_route_history';

export const getRouteHistory = (): RouteHistoryItem[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load history', error);
    return [];
  }
};

export const addRouteToHistory = (item: Omit<RouteHistoryItem, 'id' | 'timestamp'>) => {
  try {
    const current = getRouteHistory();
    // Check if the exact same search exists in the last 10, remove it to bring it to top
    const filtered = current.filter(
      (h) => !(h.origin === item.origin && h.destination === item.destination)
    );
    
    const newItem: RouteHistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    
    // Keep max 20 items
    const updated = [newItem, ...filtered].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save history', error);
  }
};

export const clearRouteHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history', error);
  }
};
