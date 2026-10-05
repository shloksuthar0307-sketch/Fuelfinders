import { useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import type { FuelStation } from '../lib/api';

maptilersdk.config.apiKey = 'nG37oSzBVvXqSMDtYxgB';

interface MapComponentProps {
  stations?: FuelStation[];
  center?: [number, number];
  zoom?: number;
  userLocation?: [number, number] | null;
  routeGeometry?: [number, number][];
}

const MapComponent = ({ stations = [], center = [20.5937, 78.9629], zoom = 5, userLocation, routeGeometry }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const markers = useRef<maptilersdk.Marker[]>([]);
  const polylineSourceId = 'route-source';

  // Initialize Map
  useEffect(() => {
    if (map.current) return;

    map.current = new maptilersdk.Map({
      container: mapContainer.current!,
      style: maptilersdk.MapStyle.STREETS,
      center: [center[1], center[0]], // [lng, lat]
      zoom: zoom,
      navigationControl: true,
      geolocateControl: false,
    });
  }, []);

  // Update center when props change
  useEffect(() => {
    if (map.current && center) {
      map.current.flyTo({ center: [center[1], center[0]], zoom: zoom });
    }
  }, [center, zoom]);

  // Handle Markers
  useEffect(() => {
    if (!map.current) return;
    
    // Clear old markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    // User Location
    if (userLocation) {
       const el = document.createElement('div');
       el.className = 'w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse';
       const m = new maptilersdk.Marker({element: el})
         .setLngLat([userLocation[1], userLocation[0]])
         .addTo(map.current);
       markers.current.push(m);
    }

    // Stations
    stations.forEach(station => {
       const isCNG = station.supported_fuels.includes('cng');
       const isPetrol = station.supported_fuels.includes('petrol');
       let color = '#2563EB'; // brand-blue
       if (isCNG) color = '#10B981'; // success
       else if (isPetrol) color = '#F97316'; // orange

       const popupHtml = `
          <div class="p-2 min-w-[180px] font-sans">
            <h3 class="font-bold text-base text-gray-900 mb-1">${station.name}</h3>
            <p class="text-xs text-gray-500 mb-3">${station.address || `${station.city}, ${station.state}`}</p>
            <div class="flex gap-1 flex-wrap mb-3">
              ${station.supported_fuels.map(f => `<span class="px-1.5 py-0.5 bg-gray-100 text-gray-700 font-bold text-[10px] rounded uppercase tracking-wider">${f}</span>`).join('')}
            </div>
            <a href="/station/${station.id}" style="display:block; text-align:center; color:white; background:#2563EB; border-radius:8px; padding:8px; font-weight:bold; text-decoration:none;">
              View Details
            </a>
          </div>
       `;
       const popup = new maptilersdk.Popup({ offset: 25 }).setHTML(popupHtml);

       const m = new maptilersdk.Marker({ color })
         .setLngLat([station.longitude, station.latitude])
         .setPopup(popup)
         .addTo(map.current!);
       markers.current.push(m);
    });

  }, [stations, userLocation]);

  // Handle Route Geometry (Polyline)
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    const drawRoute = () => {
      const source = m.getSource(polylineSourceId) as maptilersdk.GeoJSONSource;
      
      const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeGeometry ? routeGeometry.map(c => [c[1], c[0]]) : []
        }
      };

      if (source) {
        source.setData(geojson);
      } else {
        m.addSource(polylineSourceId, {
          type: 'geojson',
          data: geojson
        });

        m.addLayer({
          id: 'route-line-bg',
          type: 'line',
          source: polylineSourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 8,
            'line-opacity': 0.3
          }
        });

        m.addLayer({
          id: 'route-line',
          type: 'line',
          source: polylineSourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#2563EB',
            'line-width': 4
          }
        });
      }
    };

    if (m.isStyleLoaded()) {
      drawRoute();
    } else {
      m.once('style.load', drawRoute);
    }

  }, [routeGeometry]);

  return (
    <div className="w-full h-full relative z-0">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default MapComponent;
