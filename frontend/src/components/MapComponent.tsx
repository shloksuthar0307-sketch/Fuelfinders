import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FuelStation } from '../lib/api';

// Fix for default marker icon in Leaflet when using Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  stations?: FuelStation[];
  center?: [number, number];
  zoom?: number;
  userLocation?: [number, number] | null;
  routeGeometry?: [number, number][];
}

// Helper to recenter map when center changes
const RecenterAutomatically = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const MapComponent = ({ stations = [], center = [19.0760, 72.8777], zoom = 11, userLocation, routeGeometry }: MapComponentProps) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterAutomatically center={center} />

      {/* User Location Marker */}
      {userLocation && (
        <Marker position={userLocation}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Fuel Station Markers */}
      {stations.map((station) => (
        <Marker key={station.id} position={[station.latitude, station.longitude]}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold">{station.name}</h3>
              <p className="text-sm text-gray-600">{station.address || `${station.city}, ${station.state}`}</p>
              <div className="mt-2 flex gap-1 flex-wrap">
                {station.supported_fuels.map(f => (
                  <span key={f} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded uppercase">
                    {f}
                  </span>
                ))}
              </div>
              <a href={`/station/${station.id}`} className="block mt-3 text-center text-xs text-white bg-blue-600 rounded py-1 hover:bg-blue-700 font-medium">
                View Details
              </a>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Route Polyline */}
      {routeGeometry && routeGeometry.length > 0 && (
        <Polyline positions={routeGeometry} color="blue" weight={4} opacity={0.7} />
      )}
    </MapContainer>
  );
};

export default MapComponent;
