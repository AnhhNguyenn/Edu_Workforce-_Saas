'use client';

import { useState, useEffect } from "react";
import { CheckCircle2, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useCheckIn, useCheckOut, useMyAttendances } from "@/hooks/queries/useAttendances";
import { useProfile } from "@/hooks/queries/useProfile";
import { toast } from "react-hot-toast";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CheckinPage() {
  const { data: profile } = useProfile();
  const { data: attendances, isLoading } = useMyAttendances();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendances?.find((a: any) => a.checkInTime?.startsWith(todayStr));
  const isCheckedIn = !!todayAttendance;
  const isCheckedOut = !!todayAttendance?.checkOutTime;

  const getLocation = () => {
    setIsLocating(true);
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError("Trình duyệt không hỗ trợ định vị GPS");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        setLocError("Không thể lấy vị trí. Vui lòng cấp quyền định vị trong trình duyệt.");
        setIsLocating(false);
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleCheckIn = () => {
    if (!location) {
      toast.error("Chưa có thông tin định vị!");
      return;
    }
    checkInMutation.mutate(
      { latitude: location.lat, longitude: location.lng },
      {
        onSuccess: () => toast.success("Check-in thành công!"),
        onError: (e: any) => toast.error(e.response?.data?.message || "Check-in thất bại")
      }
    );
  };

  const handleCheckOut = () => {
    if (!location) {
      toast.error("Chưa có thông tin định vị!");
      return;
    }
    checkOutMutation.mutate(
      { latitude: location.lat, longitude: location.lng },
      {
        onSuccess: () => toast.success("Check-out thành công!"),
        onError: (e: any) => toast.error(e.response?.data?.message || "Check-out thất bại")
      }
    );
  };

  const nowString = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-edu-accent" size={32} /></div>;

  return (
    <div className="space-y-6 pt-4 flex flex-col min-h-full">
      {/* GPS Status */}
      {isLocating ? (
        <div className="bg-blue-50 text-blue-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold">
          <Loader2 size={18} className="animate-spin" />
          <span>Đang tìm vị trí GPS...</span>
        </div>
      ) : locError ? (
        <div className="bg-edu-dangerLight text-edu-danger px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold">
          <AlertCircle size={18} />
          <span>{locError}</span>
        </div>
      ) : (
        <div className="bg-edu-successLight text-edu-success px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 size={18} />
          <span>Đã xác định vị trí</span>
        </div>
      )}

      {/* Main Action Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-10">
        <div className="text-sm text-edu-muted font-medium mb-2">{profile?.schoolName || 'Cơ sở'}</div>
        <div className="text-5xl font-extrabold text-edu-fg mb-4 tabular-nums tracking-tight">{nowString}</div>
        
        {isCheckedOut ? (
           <div className="bg-gray-100 text-gray-500 px-3 py-1 rounded-md text-xs font-bold mb-10">
             Đã kết thúc ca làm việc
           </div>
        ) : isCheckedIn ? (
          <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-xs font-bold mb-10 flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            <span>Đang trong ca làm việc</span>
          </div>
        ) : (
          <div className="bg-edu-warnLight text-edu-warn px-3 py-1 rounded-md text-xs font-bold mb-10">
            Chưa Check-in
          </div>
        )}

        <button 
          onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
          disabled={isCheckedOut || !location || checkInMutation.isPending || checkOutMutation.isPending}
          className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all active:scale-[0.98] ${
            isCheckedOut || !location
              ? 'bg-gray-300 opacity-60 cursor-not-allowed transform-none' 
              : isCheckedIn
                ? 'bg-gradient-to-r from-[#FF8A65] to-[#FFB74D] shadow-lg hover:-translate-y-0.5'
                : 'bg-gradient-to-r from-edu-accent to-[#7BC4FF] shadow-lg hover:-translate-y-0.5'
          }`}
        >
          {checkInMutation.isPending || checkOutMutation.isPending ? (
            <Loader2 className="animate-spin inline mr-2" size={24} />
          ) : null}
          {isCheckedOut ? 'Hoàn thành ✓' : isCheckedIn ? 'CHECK-OUT' : 'CHECK-IN'}
        </button>
      </div>

      {/* History Area */}
      <div className="mt-auto">
        <h3 className="font-bold text-edu-fg text-sm mb-3">Lịch sử hôm nay</h3>
        {todayAttendance ? (
          <div className="space-y-2">
            <div className="bg-edu-successLight rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-edu-success text-white flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div className="text-sm font-bold text-edu-fg">
                  Check-in: {new Date(todayAttendance.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[0.7rem] text-edu-muted font-medium">{todayAttendance.status?.name || 'Thành công'}</div>
              </div>
            </div>
            {todayAttendance.checkOutTime && (
              <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-3 border border-blue-100">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-edu-fg">
                    Check-out: {new Date(todayAttendance.checkOutTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState description="Chưa có lịch sử check-in hôm nay." />
        )}
      </div>
    </div>
  );
}

