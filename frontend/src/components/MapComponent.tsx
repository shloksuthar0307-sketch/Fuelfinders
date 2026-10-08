import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FuelStation } from '../lib/api';

interface MapComponentProps {
  stations?: FuelStation[];
  center?: [number, number];
  zoom?: number;
  userLocation?: [number, number] | null;
  routeGeometry?: [number, number][];
}

// Fix for default Leaflet marker icons not showing up due to Webpack/Vite asset resolution
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createIcon = (color: string, isManual: boolean) => {
  const borderStyle = isManual ? 'border: 3px solid #FCD34D;' : 'border: 3px solid white;'; // Gold border for manual
  return new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; ${borderStyle} box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const userIcon = new L.DivIcon({
  className: 'user-marker',
  html: `<div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const originDestIcon = (isOrigin: boolean) => new L.DivIcon({
  className: 'route-point-marker',
  html: `<div style="background-color: ${isOrigin ? '#10B981' : '#EF4444'}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const AutoFitBounds = ({ routeGeometry, stations, center, zoom }: any) => {
  const map = useMap();
  useEffect(() => {
    if (routeGeometry && routeGeometry.length > 0) {
      const bounds = L.latLngBounds(routeGeometry);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      map.flyTo(center, zoom);
    }
  }, [map, routeGeometry, stations, center, zoom]);
  return null;
};

const MapComponent = ({ stations = [], center = [20.5937, 78.9629], zoom = 5, userLocation, routeGeometry = [] }: MapComponentProps) => {
  const geoapifyKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
  if (!geoapifyKey) {
    console.error("VITE_GEOAPIFY_API_KEY is not defined");
  }

  return (
    <div className="w-full h-full relative z-0">
      <div className="absolute top-4 right-4 z-[400] bg-white p-3 rounded-xl shadow-md border border-gray-100 text-xs font-medium">
        <h4 className="mb-2 text-gray-700 font-bold border-b pb-1">Legend</h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-600 border-[2px] border-white shadow-sm"></div>
            <span>Geoapify Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-600 border-[2px] border-amber-300 shadow-sm"></div>
            <span>Manual / Verified</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] text-gray-500">Has CNG</span>
          </div>
        </div>
      </div>

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        {geoapifyKey && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Powered by Geoapify'
            url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${geoapifyKey}`}
          />
        )}

        <AutoFitBounds routeGeometry={routeGeometry} stations={stations} center={center} zoom={zoom} />

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {routeGeometry.length > 0 && (
          <>
            <Polyline 
              positions={routeGeometry as L.LatLngExpression[]} 
              color="#3b82f6" 
              weight={8} 
              opacity={0.4} 
            />
            <Polyline 
              positions={routeGeometry as L.LatLngExpression[]} 
              color="#2563EB" 
              weight={4} 
            />
            <Marker position={routeGeometry[0]} icon={originDestIcon(true)}>
              <Popup>Origin</Popup>
            </Marker>
            <Marker position={routeGeometry[routeGeometry.length - 1]} icon={originDestIcon(false)}>
              <Popup>Destination</Popup>
            </Marker>
          </>
        )}

        {stations.map(station => {
          const isCNG = station.supported_fuels.includes('cng');
          const isPetrol = station.supported_fuels.includes('petrol');
          let color = '#2563EB'; // brand-blue
          if (isCNG) color = '#10B981'; // success
          else if (isPetrol) color = '#F97316'; // orange

          const isManual = station.source === 'manual';

          return (
            <Marker 
              key={station.id} 
              position={[station.latitude, station.longitude]} 
              icon={createIcon(color, isManual)}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px] font-sans">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-base text-gray-900 leading-tight pr-2">{station.name}</h3>
                    {station.is_verified && (
                      <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">Verified</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{station.address || `${station.city}, ${station.state}`}</p>
                  
                  {station.prices && station.prices.length > 0 && (
                    <div className="bg-gray-50 border border-gray-100 p-2 rounded mb-3 text-xs">
                      {station.prices.map((p, i) => (
                        <div key={i} className="flex justify-between font-medium text-gray-800 mb-1 last:mb-0">
                          <span>{p.fuel_type}:</span>
                          <span>{p.price} {p.currency}/{p.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {(station as any).detour_distance !== undefined && (
                    <div className="bg-blue-50 border border-blue-100 p-2 rounded mb-3 text-xs">
                      <div className="flex justify-between font-medium text-blue-800">
                        <span>Detour:</span>
                        <span>+{((station as any).detour_distance || 0).toFixed(1)} km</span>
                      </div>
                      <div className="flex justify-between font-medium text-blue-800 mt-1">
                        <span>Extra Time:</span>
                        <span>+{(station as any).extra_time || 0} min</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1 flex-wrap mb-3 mt-2">
                    {station.supported_fuels.map(f => (
                      <span key={f} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 font-bold text-[10px] rounded uppercase tracking-wider">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
