'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default icon issue in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapComponentProps {
  lat: number;
  lng: number;
  radius?: number;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ position, setPosition }: any) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition(pos);
        },
      }}
      position={position} 
      icon={customIcon}
    ></Marker>
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.flyTo(center, 15);
  }, [center[0], center[1], map]);
  return null;
}

export default function MapComponent({ lat, lng, radius = 200, onChange }: MapComponentProps) {
  const position = { lat, lng };
  const mapKey = useMemo(() => Math.random().toString(), []);

  return (
    <MapContainer key={mapKey} center={[lat, lng]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={[lat, lng]} />
      <Circle
        center={[lat, lng]}
        radius={radius}
        pathOptions={{
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          weight: 1.5
        }}
      />
      <LocationMarker 
        position={position} 
        setPosition={(pos: any) => onChange(pos.lat, pos.lng)} 
      />
    </MapContainer>
  );
}
