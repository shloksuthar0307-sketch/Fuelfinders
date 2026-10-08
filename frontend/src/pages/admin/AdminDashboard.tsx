import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStations, importGeoapify, deleteStation, setAuthToken } from '../../lib/api';
import type { FuelStation } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LogOut, Plus, Search, Edit2, Trash2, DownloadCloud, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import clsx from 'clsx';

export default function AdminDashboard() {
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [importCity, setImportCity] = useState('');
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    setLoading(true);
    try {
      const data = await fetchStations();
      setStations(data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    navigate('/admin/login');
  };

  const handleImport = async () => {
    if (!importCity) return;
    setImporting(true);
    setMessage('');
    try {
      const res = await importGeoapify(importCity);
      setMessage(`Successfully imported ${res.added} new stations, updated ${res.updated}.`);
      loadStations();
      setImportCity('');
    } catch (err) {
      setMessage('Failed to import stations.');
    } finally {
      setImporting(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this station?')) {
      try {
        await deleteStation(id);
        setStations(stations.filter(s => s.id !== id));
      } catch (err) {
        alert('Failed to delete.');
      }
    }
  };

  const filteredStations = stations.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.city.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || (s.address && s.address.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">Admin Dashboard</h1>
            <p className="text-brand-secondary text-sm font-medium mt-1">Manage fuel stations, import data, and verify listings.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => navigate('/admin/station/new')} 
              className="flex-1 sm:flex-none shadow-md"
              style={{ backgroundColor: '#8B0000', color: '#ffffff', opacity: 1 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Station
            </Button>
            <Button variant="outline" onClick={handleLogout} className="flex-1 sm:flex-none border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Actions & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Search/Filter Card */}
          <Card className="lg:col-span-2 p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center">
              <Search className="w-4 h-4 mr-2 text-brand-blue" />
              Search Stations
            </h2>
            <Input 
              icon={<Search className="w-4 h-4 text-gray-400" />}
              placeholder="Search by name, city, or address..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-brand-blue"
            />
          </Card>

          {/* Import Card */}
          <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-base font-bold mb-4 flex items-center text-brand-navy">
              <DownloadCloud className="w-4 h-4 mr-2 text-brand-blue" />
              Import from Geoapify
            </h2>
            <div className="flex gap-2 items-center">
              <Input 
                placeholder="Enter city (e.g. Pune)" 
                value={importCity}
                onChange={(e) => setImportCity(e.target.value)}
                className="flex-1 bg-gray-50 border-transparent bg-white "
              />
              <Button 
                onClick={handleImport} 
                disabled={importing || !importCity} 
                className="whitespace-nowrap px-4"
                style={{ backgroundColor: '#8B0000', color: '#ffffff', opacity: 1 }}
              >
                {importing ? 'Importing...' : 'Import'}
              </Button>
            </div>
            {message && (
              <div className={clsx("mt-3 text-xs p-2 rounded-lg font-medium", message.includes('Successfully') ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200")}>
                {message}
              </div>
            )}
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-brand-blue">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
              <p className="font-medium text-sm">Loading stations database...</p>
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-700 mb-1">No stations found</h3>
              <p className="text-sm">Try adjusting your search query or importing a new city.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-700 text-xs uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStations.map(station => (
                    <tr key={station.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 truncate max-w-xs">{station.name}</div>
                        {station.supported_fuels && (
                          <div className="flex gap-1 mt-1 text-[9px] uppercase font-bold tracking-wider text-gray-500">
                            {station.supported_fuels.join(' • ')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{station.city}</div>
                        <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{station.address || station.state}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                          station.external_source_id ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-purple-50 text-purple-700 border-purple-100"
                        )}>
                          {station.external_source_id ? 'Geoapify' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {station.is_verified ? (
                          <span className="inline-flex items-center text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded border border-green-100">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-500 font-medium text-xs bg-red-50 px-2 py-1 rounded border border-red-100">
                            <XCircle className="w-3 h-3 mr-1" /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => navigate(`/admin/station/${station.id}`)}
                          className="h-8 px-3 text-brand-blue hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDelete(station.id as number)}
                          className="h-8 px-3 text-red-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
