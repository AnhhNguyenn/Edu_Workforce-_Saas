'use client';

import { useState, useEffect } from 'react';
import { MapPin, BookOpen, Clock, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/queries/useProfile";
import { useSessions } from "@/hooks/queries/useSessions";
import { useRouter } from "next/navigation";
import { useMyAttendances } from "@/hooks/queries/useAttendances";
import { useClasses } from "@/hooks/queries/useClasses";
import { useSchools } from "@/hooks/queries/useSchools";
import { useUsers } from "@/hooks/queries/useUsers";
import { cn } from "@/components/ui/stat-card";

export default function TeacherDashboard() {
  const router = useRouter();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: sessionData, isLoading: isSessionsLoading } = useSessions(todayStr, todayStr);
  const { data: attendances } = useMyAttendances();
  
  const { data: classesData } = useClasses('', undefined, undefined, 1, 1000);
  const { data: schoolsData } = useSchools();
  const { data: teachersData } = useUsers('TEACHER', '', 1, 1000);
  const { data: assistantsData } = useUsers('ASSISTANT', '', 1, 1000);

  const sessions = sessionData?.items || [];
  const classes = classesData?.items || [];
  const schools = schoolsData?.items || [];
  const teachers = teachersData?.items || [];
  const assistants = assistantsData?.items || [];
  
  // Calculate checkin state
  const attendanceList = attendances?.items || (Array.isArray(attendances) ? attendances : []);
  const hasCheckedInToday = attendanceList.some((a: any) => a.checkInTime?.startsWith(todayStr));

  if (isProfileLoading || isSessionsLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-edu-accent" size={32} /></div>;
  }

  const avatarInitials = profile?.fullName ? profile.fullName.split(' ').map(n => n[0]).slice(-2).join('') : 'U';

  return (
    <div className="space-y-6 mt-2">
      {/* Teacher Info */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-edu-border shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#81C784] to-[#A5D6A7] flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {avatarInitials}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-edu-fg text-base">{profile?.fullName || "Chưa cập nhật tên"}</h3>
          <p className="text-xs text-edu-muted">{profile?.role === 'TEACHER' ? 'Giáo viên' : 'Trợ giảng'} — {profile?.schoolName || 'Chưa cập nhật cơ sở'}</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div>
        <h4 className="font-semibold text-edu-fg mb-3 text-sm flex justify-between items-center">
          <span>Lịch dạy hôm nay</span>
          <span className="text-edu-accent cursor-pointer text-xs" onClick={() => router.push('/me/schedule')}>Tất cả</span>
        </h4>
        
        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.map((s) => {
              const cls = classes.find(c => c.id === s.classId);
              const school = schools.find(sch => sch.id === (cls as any)?.schoolId);
              const teacher = teachers.find(t => t.id === s.teacherId);
              const assistantNames = s.assistantIds?.map((id: string) => assistants.find(a => a.id === id)?.fullName).filter(Boolean).join(', ');
              
              const attendance = attendanceList.find((a: any) => a.sessionId === s.id);
              
              return (
                <SessionCard 
                  key={s.id}
                  session={s}
                  attendance={attendance}
                  className={cls?.name || s.className || 'Lớp chưa đặt tên'}
                  schoolName={school?.name || 'Chưa rõ cơ sở'}
                  teacherName={teacher?.fullName || 'Chưa phân công'}
                  assistantName={assistantNames || 'Không có TG'}
                  onClick={() => router.push(`/me/schedule/${s.id}`)}
                />
              )
            })
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

function SessionCard({ session, attendance, className, schoolName, teacherName, assistantName, onClick }: { session: any, attendance: any, className: string, schoolName: string, teacherName: string, assistantName: string, onClick: () => void }) {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  
  const localDate = new Date(session.sessionDate);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const sessionEndTime = new Date(`${year}-${month}-${day}T${session.endTime || '23:59:00'}`);
  const sessionStartTime = new Date(`${year}-${month}-${day}T${session.startTime || '00:00:00'}`);

  const hasCheckedIn = !!attendance?.checkinTime;
  const hasCheckedOut = !!attendance?.checkoutTime;
  const isCompleted = session.statusCode === 'COMPLETED';

  let statusConfig = { text: 'Sắp diễn ra', colorClass: 'bg-edu-accentLight text-edu-accent', pulse: false };

  if (isCompleted) {
    statusConfig = { text: 'Hoàn thành', colorClass: 'bg-edu-successLight text-edu-success', pulse: false };
  } else if (hasCheckedOut) {
    statusConfig = { text: 'Chờ báo cáo', colorClass: 'bg-orange-100 text-orange-700', pulse: false };
  } else if (hasCheckedIn && !hasCheckedOut) {
    statusConfig = { text: now >= sessionEndTime ? 'Đang dạy (Lố giờ)' : 'Đang dạy', colorClass: 'bg-blue-100 text-blue-700', pulse: true };
  } else if (!hasCheckedIn && now >= sessionEndTime) {
    statusConfig = { text: 'Vắng / Đã qua', colorClass: 'bg-red-100 text-red-600', pulse: false };
  } else if (!hasCheckedIn && now >= sessionStartTime && now < sessionEndTime) {
    statusConfig = { text: 'Trễ Check-in', colorClass: 'bg-yellow-100 text-yellow-700', pulse: true };
  }

  const formatTime = (isoString?: string) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const timeStr = session.startTime ? session.startTime.substring(0, 5) : '--:--';
  const endTimeStr = session.endTime ? session.endTime.substring(0, 5) : '--:--';
  
  return (
    <div 
      onClick={onClick}
      className={`flex gap-4 p-4 rounded-xl border transition-all cursor-pointer active:bg-edu-accentLighter ${isCompleted ? 'bg-slate-50 border-transparent opacity-80' : 'bg-white border-edu-border border-l-4 border-l-edu-accent shadow-sm'}`}
    >
      <div className={`flex flex-col items-center justify-center min-w-[60px] ${isCompleted ? 'text-edu-muted' : 'text-edu-accent'}`}>
        <span className="text-lg font-black">{timeStr}</span>
        <span className="text-[10px] font-bold opacity-70 mt-1 uppercase">đến</span>
        <span className="text-sm font-bold opacity-80">{endTimeStr}</span>
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1.5">
          <h3 className={cn("font-bold truncate text-[15px] pr-2", isCompleted ? "text-slate-500" : "text-slate-800")}>
            {className} - {schoolName}
          </h3>
          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap tracking-wide w-fit", statusConfig.colorClass, statusConfig.pulse ? 'animate-pulse ring-1 ring-opacity-50' : '')}>
            {statusConfig.text}
          </span>
        </div>
        <div className="text-[13px] text-edu-muted flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-1.5 font-semibold text-edu-accent">
            <BookOpen size={14} />
            <span className="truncate max-w-[200px]">{session.lessonTitle || 'Chưa có chủ đề'}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap text-slate-500">
            <span className="bg-slate-50 px-2 py-0.5 rounded-md whitespace-nowrap">GV: {teacherName}</span>
            <span className="bg-slate-50 px-2 py-0.5 rounded-md whitespace-nowrap">TG: {assistantName}</span>
          </div>
          {(hasCheckedIn || hasCheckedOut) && (
            <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1">
              {hasCheckedIn && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-edu-success"></div>
                  <span className="font-semibold text-slate-700">Check-in:</span>
                  <span className="text-edu-success font-medium">{formatTime(attendance.checkinTime)}</span>
                </div>
              )}
              {hasCheckedOut && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-edu-accent"></div>
                  <span className="font-semibold text-slate-700">Check-out:</span>
                  <span className="text-edu-accent font-medium">{formatTime(attendance.checkoutTime)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

