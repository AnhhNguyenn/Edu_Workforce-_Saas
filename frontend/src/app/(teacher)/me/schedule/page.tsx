'use client';

import { useState, useMemo, useEffect } from 'react';
import { BookOpen, MapPin, Users, Loader2, ChevronRight, Calendar as CalendarIcon, ChevronLeft, CheckCircle2, Navigation, FileText } from "lucide-react";
import { useSessions } from "@/hooks/queries/useSessions";
import { useClasses } from "@/hooks/queries/useClasses";
import { useSchools } from "@/hooks/queries/useSchools";
import { useUsers } from "@/hooks/queries/useUsers";
import { useCheckIn, useCheckOut, useMyAttendances } from "@/hooks/queries/useAttendances";
import { useProfile } from "@/hooks/queries/useProfile";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/components/ui/stat-card";
import { ReportModal } from "@/components/schedule/ReportModal";
import { AttendanceActionModal } from "@/components/schedule/AttendanceActionModal";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

// Utility to get dates of the current week (Mon-Sun) given a base date
function getWeekDates(baseDate: Date) {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  
  const monday = new Date(date.setDate(diff));
  const week = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    week.push(nextDay);
  }
  return week;
}

const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function SchedulePage() {
  const router = useRouter();
  
  // State for the selected date, defaults to today
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // State for the base date of the week being viewed
  const [weekBaseDate, setWeekBaseDate] = useState<Date>(new Date());

  const weekDates = useMemo(() => getWeekDates(weekBaseDate), [weekBaseDate]);

  // Format date for API (YYYY-MM-DD)
  const dateStr = selectedDate.toISOString().split('T')[0];
  
  const { data: sessionData, isLoading } = useSessions(dateStr, dateStr);
  const sessions = sessionData?.items || [];
  
  const { data: myAttendances } = useMyAttendances();
  
  const { data: classesData } = useClasses('', undefined, undefined, 1, 1000);
  const classes = classesData?.items || [];
  
  const { data: schoolsData } = useSchools();
  const schools = schoolsData?.items || [];
  
  const { data: teachersData } = useUsers('TEACHER', '', 1, 1000);
  const teachers = teachersData?.items || [];
  
  const { data: assistantsData } = useUsers('ASSISTANT', '', 1, 1000);
  const assistants = assistantsData?.items || [];
  
  const { data: profile } = useProfile();
  const userRole = profile?.role || 'TEACHER';

  // Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Attendance Action Modal state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'checkin' | 'checkout'>('checkin');
  const [actionSession, setActionSession] = useState<any>(null);
  const [isOutOfRange, setIsOutOfRange] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      // Warm up GPS as soon as teacher opens the schedule page
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {},
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  const [reportSession, setReportSession] = useState<{ id: string, title: string } | null>(null);

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const handleModalSubmit = async (photoBase64: string | null, reason: string | null) => {
    if (!actionSession) return;
    
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị GPS');
      return;
    }

    toast.loading('Đang lấy vị trí...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        toast.dismiss('geo');
        try {
          if (actionType === 'checkin') {
            await checkInMutation.mutateAsync({
              sessionId: actionSession.id,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              photoBase64: photoBase64,
              note: reason
            });
            toast.success('Check-in thành công!');
          } else {
            await checkOutMutation.mutateAsync({
              sessionId: actionSession.id,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              note: reason
            });
            toast.success('Check-out thành công!');
          }
          setActionModalOpen(false);
          setIsOutOfRange(false);
        } catch (error: any) {
          const errMsg = error.response?.data?.Message || error.response?.data?.message || `Lỗi khi ${actionType}`;
          if (errMsg === 'OUT_OF_RANGE') {
            setIsOutOfRange(true);
            toast.error("Bạn đang ngoài cơ sở. Vui lòng ghi rõ lý do giải trình.");
          } else {
            toast.error(errMsg);
          }
        }
      },
      (error) => {
        toast.dismiss('geo');
        toast.error('Vui lòng cho phép quyền truy cập vị trí');
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const handlePrevWeek = () => {
    const newBase = new Date(weekBaseDate);
    newBase.setDate(newBase.getDate() - 7);
    setWeekBaseDate(newBase);
  };

  const handleNextWeek = () => {
    const newBase = new Date(weekBaseDate);
    newBase.setDate(newBase.getDate() + 7);
    setWeekBaseDate(newBase);
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setWeekBaseDate(today);
  };

  return (
    <div className="space-y-4 pt-4 pb-24 md:pb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-edu-fg flex items-center gap-2">
          <CalendarIcon size={24} className="text-edu-accent" /> Lịch dạy của tôi
        </h2>
        <p className="text-xs text-edu-muted mt-1">Quản lý các ca dạy và thực hiện điểm danh, báo cáo</p>
      </div>

      {/* Date Strip */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sticky top-[70px] z-10 mb-6">
        <div className="flex justify-between items-center mb-4 px-2">
          <button onClick={handlePrevWeek} className="p-1 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="text-[15px] font-bold text-slate-800 flex items-center gap-2 cursor-pointer hover:text-edu-accent transition-colors" onClick={handleJumpToToday}>
            Tháng {weekBaseDate.getMonth() + 1}, {weekBaseDate.getFullYear()}
            {new Date().toDateString() !== selectedDate.toDateString() && (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold tracking-wide">Hôm nay</span>
            )}
          </div>
          <button onClick={handleNextWeek} className="p-1 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="flex justify-between px-1 mt-2">
          {weekDates.map((date, idx) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={idx}
                onClick={() => setSelectedDate(date)}
                className="flex flex-col items-center justify-start gap-1.5 cursor-pointer group w-10"
              >
                <span className={cn(
                  "text-[10px] uppercase font-bold tracking-wide", 
                  isToday ? "text-edu-accent" : "text-slate-400 group-hover:text-slate-500"
                )}>
                  {dayNames[date.getDay()]}
                </span>
                <div className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full text-[17px] font-bold transition-all duration-200",
                  isSelected 
                    ? "bg-edu-accent text-white shadow-md shadow-edu-accent/30" 
                    : isToday 
                      ? "bg-blue-50 text-edu-accent" 
                      : "text-slate-700 group-hover:bg-slate-100"
                )}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-edu-accent" size={32} /></div>
        ) : sessions.length > 0 ? (
          sessions.map((s) => {
            const cls = classes.find(c => c.id === s.classId);
            const className = cls?.name || s.className || 'Lớp chưa đặt tên';
            const school = schools.find(sch => sch.id === (cls as any)?.schoolId);
            const teacher = teachers.find(t => t.id === s.teacherId);
            const assistantNames = s.assistantIds?.map((id: string) => assistants.find(a => a.id === id)?.fullName).filter(Boolean).join(', ');
            
            const attendanceList = (myAttendances as any)?.items || (Array.isArray(myAttendances) ? myAttendances : []);
            const attendance = attendanceList.find((a: any) => a.sessionId === s.id);
            
            return (
              <SessionAgendaCard 
                key={s.id} 
                session={s} 
                attendance={attendance}
                className={className}
                schoolName={school?.name || 'Chưa rõ cơ sở'}
                teacherName={teacher?.fullName || 'Chưa phân công'}
                assistantName={assistantNames || 'Không có TG'}
                onClick={() => router.push(`/me/schedule/${s.id}`)}
                onReport={() => setReportSession({ id: s.id, title: className })}
                onAction={(type, sess) => { setActionType(type); setActionSession(sess); setIsOutOfRange(false); setActionModalOpen(true); }}
              />
            )
          })
        ) : (
          <div className="mt-8">
            <EmptyState description={`Không có ca dạy nào vào ngày ${selectedDate.toLocaleDateString('vi-VN')}`} />
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportSession && (
        <ReportModal
          isOpen={true}
          onClose={() => setReportSession(null)}
          sessionId={reportSession.id}
          sessionTitle={reportSession.title}
          userRole={userRole}
        />
      )}
      {/* Attendance Action Modal */}
      {actionSession && (() => {
        const actionSessionClass = classes.find(c => c.id === actionSession?.classId);
        const actionSessionSchool = schools.find(sch => sch.id === (actionSessionClass as any)?.schoolId);
        return (
          <AttendanceActionModal
            isOpen={actionModalOpen}
            onClose={() => setActionModalOpen(false)}
            type={actionType}
            session={actionSession}
            school={actionSessionSchool}
            onSubmit={handleModalSubmit}
            isLoading={actionType === 'checkin' ? checkInMutation.isPending : checkOutMutation.isPending}
            isOutOfRange={isOutOfRange}
            setIsOutOfRange={setIsOutOfRange}
          />
        );
      })()}
    </div>
  );
}

function SessionAgendaCard({ session, attendance, className, schoolName, teacherName, assistantName, onClick, onReport, onAction }: { session: any, attendance: any, className: string, schoolName: string, teacherName: string, assistantName: string, onClick: () => void, onReport: () => void, onAction: (type: 'checkin'|'checkout', session: any) => void }) {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000); // Update every 30s
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
  } else if (!hasCheckedIn && now >= new Date(sessionStartTime.getTime() - 5 * 60 * 1000) && now < sessionEndTime) {
    const startTimePlus3 = new Date(sessionStartTime.getTime() + 3 * 60 * 1000);
    if (now <= startTimePlus3) {
      statusConfig = { text: 'Chờ Check-in', colorClass: 'bg-green-100 text-green-700', pulse: true };
    } else {
      statusConfig = { text: 'Trễ Check-in', colorClass: 'bg-yellow-100 text-yellow-700', pulse: true };
    }
  }

  const formatTime = (isoString?: string) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };


  const startTimeStr = session.startTime ? session.startTime.substring(0, 5) : '--:--';
  const endTimeStr = session.endTime ? session.endTime.substring(0, 5) : '--:--';

  // Determine styles based on status
  let borderColor = 'border-l-edu-accent shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-100 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.15)]';
  
  if (isCompleted) {
    borderColor = 'border-l-gray-300 opacity-60 bg-slate-50';
  } else if (hasCheckedIn && !hasCheckedOut) {
    borderColor = 'border-l-blue-500 shadow-md border border-blue-50 bg-blue-50/30';
  } else if (!hasCheckedIn && now >= sessionEndTime) {
    borderColor = 'border-l-red-400 opacity-80 bg-red-50/20';
  }

  let badgeColor = statusConfig.colorClass;
  let badgeText = statusConfig.text;
  if (statusConfig.pulse) {
    badgeColor += " animate-pulse";
  }
  return (
    <div 
      onClick={onClick}
      className={cn(
        "rounded-2xl p-4 flex gap-4 transition-all duration-300 cursor-pointer bg-white hover:-translate-y-0.5 active:scale-[0.98]",
        "border-l-4", borderColor
      )}
    >
      {/* Time Column */}
      <div className="flex flex-col items-center justify-center min-w-[60px] border-r pr-4">
        <span className={cn("text-lg font-black", isCompleted ? "text-gray-500" : "text-gray-800")}>{startTimeStr}</span>
        <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">đến</span>
        <span className="text-sm font-bold text-gray-500">{endTimeStr}</span>
      </div>

      {/* Details Column */}
      <div className="flex-1 overflow-hidden flex flex-col justify-center">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1.5">
          <h3 className={cn("font-bold truncate text-[15px] pr-2", isCompleted ? "text-slate-500" : "text-slate-800")}>
            {className} - {schoolName}
          </h3>
          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap tracking-wide w-fit", badgeColor)}>
            {badgeText}
          </span>
        </div>
        
        <div className="text-[13px] font-semibold text-edu-accent truncate mb-2 flex items-center gap-1.5">
          <BookOpen size={14} className="opacity-70" />
          {session.lessonTitle || 'Chưa cập nhật chủ đề'}
        </div>

        <div className="flex items-center gap-2 flex-wrap text-[11px] font-medium text-slate-500 mb-3">
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
            <span className="font-bold text-slate-700">GV:</span> {teacherName}
          </div>
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
            <span className="font-bold text-slate-700">TG:</span> {assistantName}
          </div>
        </div>

        {(hasCheckedIn || hasCheckedOut) && (
          <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1.5 w-max pr-6">
            {hasCheckedIn && (
              <div className="flex items-center gap-2 text-[12px]">
                <div className="w-1.5 h-1.5 rounded-full bg-edu-success"></div>
                <span className="font-semibold text-slate-700">Check-in:</span>
                <span className="text-edu-success font-semibold">{formatTime(attendance.checkinTime)}</span>
              </div>
            )}
            {hasCheckedOut && (
              <div className="flex items-center gap-2 text-[12px]">
                <div className="w-1.5 h-1.5 rounded-full bg-edu-accent"></div>
                <span className="font-semibold text-slate-700">Check-out:</span>
                <span className="text-edu-accent font-semibold">{formatTime(attendance.checkoutTime)}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] font-medium text-slate-500">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md whitespace-nowrap">
              <MapPin size={12} className="text-slate-400 shrink-0" />
              <span className="truncate max-w-[120px]">{session.roomName || 'Chưa xếp phòng'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md whitespace-nowrap">
              <Users size={12} className="text-slate-400 shrink-0" />
              <span>{session.actualStudentCount || 0} Học viên</span>
            </div>
          </div>
          
          {/* Quick Actions removed as per user request */}
        </div>
      </div>
    </div>
  );
}
