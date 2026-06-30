'use client';

import { MapPin, BookOpen, Clock, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/queries/useProfile";
import { useSessions } from "@/hooks/queries/useSessions";
import { useRouter } from "next/navigation";
import { useMyAttendances } from "@/hooks/queries/useAttendances";

export default function TeacherDashboard() {
  const router = useRouter();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: sessionData, isLoading: isSessionsLoading } = useSessions(todayStr, todayStr);
  const { data: attendances } = useMyAttendances();

  const sessions = sessionData?.items || [];
  
  // Calculate checkin state
  const hasCheckedInToday = attendances?.some((a: any) => a.checkInTime?.startsWith(todayStr));

  if (isProfileLoading || isSessionsLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-edu-accent" size={32} /></div>;
  }

  const avatarInitials = profile?.fullName ? profile.fullName.split(' ').map(n => n[0]).slice(-2).join('') : 'U';

  return (
    <div className="space-y-6 mt-2">
      {/* Teacher Info */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#81C784] to-[#A5D6A7] flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {avatarInitials}
        </div>
        <div>
          <h3 className="font-semibold text-edu-fg text-base">{profile?.fullName || "Chưa cập nhật tên"}</h3>
          <p className="text-xs text-edu-muted">{profile?.role === 'TEACHER' ? 'Giáo viên' : 'Trợ giảng'} — {profile?.schoolName || 'Chưa cập nhật cơ sở'}</p>
        </div>
      </div>

      {/* Checkin Action Box */}
      <div className="bg-white rounded-2xl border border-edu-border p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-medium bg-blue-50 text-blue-600 px-3 py-2 rounded-lg">
             <MapPin size={16} />
             <span>{profile?.schoolName}</span>
          </div>
          {hasCheckedInToday && (
            <span className="text-xs font-bold text-edu-success bg-edu-successLight px-2 py-1 rounded">Đã Check-in</span>
          )}
        </div>
        
        <button 
          onClick={() => router.push('/me/checkin')}
          className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-edu-accent to-[#7BC4FF] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-edu-accent/30 transition-all active:scale-[0.98]"
        >
          {hasCheckedInToday ? 'Xem Check-in/Check-out' : 'Check-in Ca Dạy'}
        </button>
      </div>

      {/* Today's Schedule */}
      <div>
        <h4 className="font-semibold text-edu-fg mb-3 text-sm flex justify-between items-center">
          <span>Lịch dạy hôm nay</span>
          <span className="text-edu-accent cursor-pointer text-xs" onClick={() => router.push('/me/schedule')}>Tất cả</span>
        </h4>
        
        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.map((s) => (
              <SessionCard 
                key={s.id}
                session={s}
                onClick={() => router.push(`/me/schedule/${s.id}`)}
              />
            ))
          ) : (
             <div className="text-center text-edu-muted text-sm py-6 border border-dashed rounded-xl border-edu-border">
               Hôm nay bạn không có ca dạy nào.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session, onClick }: { session: any, onClick: () => void }) {
  const isCompleted = session.statusCode === 'COMPLETED';
  const timeStr = session.startTime ? session.startTime.substring(0, 5) : '--:--';
  
  return (
    <div 
      onClick={onClick}
      className={`flex gap-4 p-4 rounded-xl border transition-all cursor-pointer active:bg-edu-accentLighter ${isCompleted ? 'bg-edu-bg border-transparent opacity-80' : 'bg-white border-edu-border border-l-4 border-l-edu-accent shadow-sm'}`}
    >
      <div className={`text-sm font-bold mt-0.5 ${isCompleted ? 'text-edu-muted' : 'text-edu-accent'}`}>
        {timeStr}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-edu-fg text-sm mb-0.5">Mã Lớp: {session.classId.substring(0, 8)}...</div>
        <div className="text-xs text-edu-muted flex items-center gap-1.5 mb-2">
          <BookOpen size={12} />
          <span className="truncate max-w-[200px]">{session.lessonTitle || 'Chưa có chủ đề'}</span>
        </div>
        <div className="flex gap-2 mt-2">
          {isCompleted ? (
            <span className="text-[0.65rem] font-bold px-2 py-1 bg-edu-successLight text-edu-success rounded-md">Đã hoàn thành</span>
          ) : session.statusCode === 'ONGOING' ? (
            <span className="text-[0.65rem] font-bold px-2 py-1 bg-blue-100 text-blue-600 rounded-md">Đang diễn ra</span>
          ) : (
            <span className="text-[0.65rem] font-bold px-2 py-1 bg-edu-accentLight text-edu-accent rounded-md">Sắp diễn ra</span>
          )}
        </div>
      </div>
    </div>
  );
}

