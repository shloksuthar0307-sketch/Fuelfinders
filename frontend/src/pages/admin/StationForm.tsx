import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchStation, createStation, updateStation, geocodeSearchV3, createPrice, deletePrice } from '../../lib/api';
import type { FuelStation } from '../../lib/api';
// Card import removed
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LocationAutocomplete } from '../../components/ui/LocationAutocomplete';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Trash2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  
  const map = useMap();
  useEffect(() => {
    if (position[0] !== 0) {
      map.flyTo(position, map.getZoom());
    }
  }, [position]);

  return position[0] !== 0 ? (
    <Marker position={position} icon={icon}></Marker>
  ) : null;
}

export default function StationForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<FuelStation>>({
    name: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    opening_hours: '',
    is_verified: true,
    latitude: 0,
    longitude: 0,
    supported_fuels: []
  });

  const [prices, setPrices] = useState<any[]>([]);
  const [newPrice, setNewPrice] = useState({ fuel_type: 'petrol', price: '', unit: 'litre' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [plusCode, setPlusCode] = useState('');

  const handlePlusCodeChange = async (code: string) => {
    setPlusCode(code);
    if (code.length > 5) {
      try {
        const results = await geocodeSearchV3(code);
        if (results && results.length > 0) {
          const res = results[0];
          setFormData(prev => ({
            ...prev,
            latitude: parseFloat(res.lat),
            longitude: parseFloat(res.lon)
          }));
        }
      } catch (err) {}
    }
  };

  useEffect(() => {
    if (isEdit) {
      loadStation();
    }
  }, [id]);

  const loadStation = async () => {
    try {
      const data = await fetchStation(id as string);
      setFormData(data);
      if (data.prices) setPrices(data.prices);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
         navigate('/admin/login');
      }
      alert('Failed to load station');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!plusCode && (!formData.latitude || !formData.longitude)) {
      alert("Please provide either a Google Plus Code, or manually enter Latitude and Longitude.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateStation(formData.db_id as number || formData.id as number, formData);
      } else {
        await createStation(formData);
      }
      navigate('/admin');
    } catch (err) {
      alert('Failed to save station');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrice = async () => {
    if (!formData.db_id && !formData.id) {
       alert("Please save the station first before adding prices");
       return;
    }
    const targetId = formData.db_id || formData.id;
    try {
      const added = await createPrice(targetId as number, newPrice);
      setPrices([...prices, added]);
      setNewPrice({ fuel_type: 'petrol', price: '', unit: 'litre' });
    } catch (err) {
      alert("Failed to add price");
    }
  };

  const handleDeletePrice = async (priceId: number) => {
    try {
      await deletePrice(priceId);
      setPrices(prices.filter(p => p.id !== priceId));
    } catch (err) {
      alert("Failed to delete price");
    }
  };

  const handleFuelChange = (fuel: string) => {
    const fuels = formData.supported_fuels || [];
    if (fuels.includes(fuel)) {
      setFormData({ ...formData, supported_fuels: fuels.filter(f => f !== fuel) });
    } else {
      setFormData({ ...formData, supported_fuels: [...fuels, fuel] });
    }
  };

  const handleSearchSelect = async (query: string) => {
    setSearchQuery(query);
    const results = await geocodeSearchV3(query);
    if (results && results.length > 0) {
      const res = results[0];
      setFormData(prev => ({
        ...prev,
        address: res.display_name,
        latitude: parseFloat(res.lat),
        longitude: parseFloat(res.lon)
      }));
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row relative h-[calc(100vh-4rem)]">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={[formData.latitude || 20, formData.longitude || 78]} zoom={formData.latitude ? 13 : 4} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker position={[formData.latitude || 0, formData.longitude || 0]} setPosition={(pos) => setFormData({...formData, latitude: pos[0], longitude: pos[1]})} />
        </MapContainer>
      </div>

      {/* Floating Form Panel */}
      <div className="relative z-10 w-full md:w-[480px] md:h-full pointer-events-none p-3 sm:p-6 flex flex-col justify-end md:justify-start">
        <div className="glass-card flex flex-col pointer-events-auto shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 p-5">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white/95 backdrop-blur-xl z-20 pb-3 border-b border-gray-100 -mt-1 pt-1">
            <h1 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Station' : 'Add New Station'}</h1>
            <Button onClick={() => navigate('/admin')} variant="outline" size="sm">Back to Dashboard</Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                 <label className="block text-[13px] font-medium mb-1 text-blue-800">Search Address to Auto-fill</label>
                 <LocationAutocomplete 
                    value={searchQuery}
                    onChange={handleSearchSelect}
                    placeholder="Search for a location..."
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-medium mb-1 text-gray-700">Name</label>
                  <Input required className="w-full h-9 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-medium mb-1 text-gray-700">Address</label>
                  <Input className="w-full h-9 text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1 text-gray-700">City</label>
                  <Input className="w-full h-9 text-sm" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1 text-gray-700">State</label>
                  <Input className="w-full h-9 text-sm" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-medium mb-1 text-gray-700">Opening Hours</label>
                  <Input className="w-full h-9 text-sm" value={formData.opening_hours} onChange={e => setFormData({...formData, opening_hours: e.target.value})} />
                </div>
                <div className="flex items-center mt-1 md:col-span-2 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                  <input type="checkbox" id="verified" checked={formData.is_verified} onChange={e => setFormData({...formData, is_verified: e.target.checked})} className="mr-2 rounded border-gray-300 text-brand-blue" />
                  <label htmlFor="verified" className="text-[13px] font-medium text-gray-700">Verified Station</label>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium mb-1.5 text-gray-700">Supported Fuels</label>
                <div className="flex gap-4">
                  {['petrol', 'diesel', 'cng'].map(fuel => (
                    <label key={fuel} className="flex items-center capitalize text-[13px] text-gray-700">
                      <input type="checkbox" checked={(formData.supported_fuels || []).includes(fuel)} onChange={() => handleFuelChange(fuel)} className="mr-2 rounded border-gray-300 text-brand-blue" />
                      {fuel}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="block text-[13px] font-medium mb-1.5 text-gray-700">Location Settings</p>
                <div>
                  <Input 
                    placeholder="Paste Plus Code (e.g. 2MMG+VC Ahmedabad, Gujarat)" 
                    value={plusCode} 
                    onChange={(e) => handlePlusCodeChange(e.target.value)} 
                    className="w-full h-9 text-sm" 
                  />
                  <p className="text-[11px] text-gray-500 mt-1 leading-tight">Paste a Google Plus code above to automatically set the map pin, or click directly on the map.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[12px] font-medium mb-1 text-gray-600">
                      Latitude {!plusCode && <span className="text-red-500">*</span>}
                    </label>
                    <Input 
                      type="number" 
                      step="any"
                      required={!plusCode}
                      value={formData.latitude || ''} 
                      onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value) || 0})} 
                      className="w-full h-9 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1 text-gray-600">
                      Longitude {!plusCode && <span className="text-red-500">*</span>}
                    </label>
                    <Input 
                      type="number" 
                      step="any"
                      required={!plusCode}
                      value={formData.longitude || ''} 
                      onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value) || 0})} 
                      className="w-full h-9 text-sm" 
                    />
                  </div>
                </div>
              </div>

              {isEdit && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h2 className="text-sm font-bold mb-3 text-gray-800">Prices</h2>
                  {prices.map((p, i) => (
                    <div key={p.id || i} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg mb-2 text-xs border border-gray-100">
                      <span className="font-medium text-gray-700">{p.fuel_type.toUpperCase()} - {p.price} / {p.unit}</span>
                      {p.id && (
                        <Button variant="danger" size="sm" type="button" onClick={() => handleDeletePrice(p.id)} className="h-6 w-6 p-0 bg-transparent text-red-500 hover:bg-red-50 hover:text-red-600 border-none shadow-none">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-3 items-end">
                     <select className="border-gray-300 rounded-md p-1.5 text-xs focus:ring-brand-blue flex-1" value={newPrice.fuel_type} onChange={(e) => setNewPrice({...newPrice, fuel_type: e.target.value})}>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="cng">CNG</option>
                     </select>
                     <Input type="number" step="0.01" placeholder="Price" value={newPrice.price} onChange={e => setNewPrice({...newPrice, price: e.target.value})} className="w-20 h-8 text-xs" />
                     <select className="border-gray-300 rounded-md p-1.5 text-xs focus:ring-brand-blue" value={newPrice.unit} onChange={(e) => setNewPrice({...newPrice, unit: e.target.value})}>
                        <option value="litre">Litre</option>
                        <option value="kg">Kg</option>
                     </select>
                     <Button type="button" onClick={handleAddPrice} size="sm" className="h-8 text-xs px-2 whitespace-nowrap">Add Price</Button>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full mt-2 h-10 shadow-sm" size="default">
                {loading ? 'Saving...' : 'Save Station'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

