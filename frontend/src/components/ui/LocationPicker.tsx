'use client';

import dynamic from 'next/dynamic';
import { Loader2, Search } from 'lucide-react';
import { useState } from 'react';

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
  onAddressChange?: (address: string) => void;
  className?: string;
}

export default function LocationPicker({ lat, lng, onChange, onAddressChange, className = "h-64" }: LocationPickerProps) {
  // Mặc định là Hà Nội nếu chưa có tọa độ
  const defaultLat = lat || 21.028511;
  const defaultLng = lng || 105.804817;

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleLocationChange = async (newLat: number, newLng: number) => {
    onChange(newLat, newLng);
    if (onAddressChange) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&accept-language=vi,en`);
        const data = await res.json();
        if (data && data.address) {
          const { house_number, road, neighbourhood, suburb, city_district, county, city, state, country } = data.address;
          // Build a clean address without building names or POI names (which might contain foreign languages like "9방")
          const addressParts = [
            house_number, 
            road, 
            neighbourhood,
            suburb, 
            city_district || county, 
            city || state, 
            country
          ].filter(Boolean); // Lọc bỏ các giá trị undefined/null/rỗng
          
          const cleanAddress = addressParts.join(', ');
          onAddressChange(cleanAddress || data.display_name);
        } else if (data && data.display_name) {
          onAddressChange(data.display_name);
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
      }
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        handleLocationChange(parseFloat(result.lat), parseFloat(result.lon));
      } else {
        alert("Không tìm thấy địa chỉ này trên bản đồ. Vui lòng nhập chi tiết hơn.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`w-full rounded-lg border border-edu-border overflow-hidden relative ${className}`}>
      <div className="absolute top-2 left-2 right-2 z-[400]">
        <form onSubmit={handleSearch} className="flex gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-edu-border">
           <div className="flex-1 flex items-center pl-2">
             <Search size={16} className="text-edu-muted" />
             <input 
               type="text" 
               placeholder="Tìm kiếm địa chỉ trên bản đồ..." 
               className="flex-1 px-2 py-1 text-sm outline-none bg-transparent"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <button 
             type="submit" 
             disabled={isSearching || !searchQuery.trim()}
             className="bg-edu-accent text-white px-4 py-1.5 rounded-md text-sm hover:bg-edu-accent/90 disabled:opacity-50 flex items-center justify-center transition-colors"
           >
             {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Tìm'}
           </button>
           <button
             type="button"
             title="Lấy vị trí hiện tại của bạn"
             onClick={() => {
               if (navigator.geolocation) {
                 navigator.geolocation.getCurrentPosition(
                   (position) => {
                     handleLocationChange(position.coords.latitude, position.coords.longitude);
                   },
                   (error) => {
                     alert("Không thể lấy vị trí hiện tại. Vui lòng cấp quyền truy cập vị trí cho trình duyệt và thiết bị.");
                   },
                   { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                 );
               } else {
                 alert("Trình duyệt của bạn không hỗ trợ định vị GPS.");
               }
             }}
             className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-200 border border-gray-200 transition-colors flex items-center justify-center"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H22"/><path d="M12 12v10"/><path d="M12 12 2.1 7.1"/><path d="M12 12l9.9-4.9"/></svg>
           </button>
        </form>
      </div>
      <MapComponent lat={defaultLat} lng={defaultLng} onChange={handleLocationChange} />
      <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-sm z-[400] text-xs text-center text-edu-fg font-medium pointer-events-none">
        Click vào bản đồ để thả ghim vị trí cơ sở
      </div>
    </div>
  );
}
