import { useState, useEffect } from 'react';
import { Clock, Navigation, MapPin, Calendar, Trash2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { getRouteHistory, clearRouteHistory, type RouteHistoryItem } from '../lib/history';
import { Link } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useState<RouteHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getRouteHistory());
  }, []);

  const handleClear = () => {
    clearRouteHistory();
    setHistory([]);
  };

  const formatDistance = (meters?: number) => meters ? (meters / 1000).toFixed(1) + ' km' : '--';
  const formatTime = (seconds?: number) => {
    if (!seconds) return '--';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };
  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-8 bg-brand-bg fade-in overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-navy tracking-tight">Route History</h1>
              <p className="text-brand-secondary font-medium">Your recent trips and searches</p>
            </div>
          </div>
          {history.length > 0 && (
            <button onClick={handleClear} className="flex items-center text-sm font-medium text-red-500 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <Card className="shadow-lg border-dashed">
            <CardHeader className="text-center pb-2 pt-12">
              <Navigation className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <CardTitle className="text-xl">No recent routes</CardTitle>
              <CardDescription className="max-w-md mx-auto mt-2">
                Your searched routes and navigation history will appear here so you can easily plan similar trips.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-12" />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {history.map((item) => (
              <Link 
                key={item.id} 
                to={`/search?origin=${encodeURIComponent(item.origin)}&dest=${encodeURIComponent(item.destination)}&fuels=${item.fuels.join(',')}`}
                className="block group"
              >
                <Card className="shadow-md hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer h-full border border-gray-100">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        {formatDate(item.timestamp)}
                      </div>
                      <div className="flex gap-1">
                        {item.fuels.map(f => (
                          <span key={f} className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start">
                        <div className="mt-1 mr-3 bg-blue-100 p-1.5 rounded-full shrink-0">
                          <Navigation className="h-4 w-4 text-brand-blue" />
                        </div>
                        <div>
                          <p className="text-xs text-brand-secondary font-semibold uppercase tracking-wider mb-0.5">Origin</p>
                          <p className="font-semibold text-slate-800 line-clamp-1">{item.origin}</p>
                        </div>
                      </div>
                      
                      <div className="ml-3.5 border-l-2 border-dashed border-gray-200 h-6 -my-2"></div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 mr-3 bg-red-100 p-1.5 rounded-full shrink-0">
                          <MapPin className="h-4 w-4 text-brand-danger" />
                        </div>
                        <div>
                          <p className="text-xs text-brand-secondary font-semibold uppercase tracking-wider mb-0.5">Destination</p>
                          <p className="font-semibold text-slate-800 line-clamp-1">{item.destination}</p>
                        </div>
                      </div>
                    </div>

                    {(item.distance !== undefined || item.time !== undefined) && (
                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {item.distance !== undefined && (
                            <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded">
                              <Navigation className="w-4 h-4 mr-1.5 text-blue-500" />
                              {formatDistance(item.distance)}
                            </div>
                          )}
                          {item.time !== undefined && (
                            <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded">
                              <Clock className="w-4 h-4 mr-1.5 text-emerald-500" />
                              {formatTime(item.time)}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-brand-blue transition-colors" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
