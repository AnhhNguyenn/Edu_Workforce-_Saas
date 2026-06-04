'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <Loader2 className="w-6 h-6 animate-spin text-edu-accent" />
    </div>
  ),
});

interface LocationPickerProps {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

export default function LocationPicker({ lat, lng, onChange, className = "h-64" }: LocationPickerProps) {
  // Mặc định là Hà Nội nếu chưa có tọa độ
  const defaultLat = lat || 21.028511;
  const defaultLng = lng || 105.804817;

  return (
    <div className={`w-full rounded-lg border border-edu-border overflow-hidden relative ${className}`}>
      <MapComponent lat={defaultLat} lng={defaultLng} onChange={onChange} />
      <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-sm z-[400] text-xs text-center text-edu-fg font-medium pointer-events-none">
        Click vào bản đồ để thả ghim vị trí cơ sở
      </div>
    </div>
  );
}
