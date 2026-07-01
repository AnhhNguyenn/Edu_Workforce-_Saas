'use client';

import { useState, useMemo } from 'react';
import { BookOpen, MapPin, Users, Loader2, ChevronRight, Calendar as CalendarIcon, ChevronLeft } from "lucide-react";
import { useSessions } from "@/hooks/queries/useSessions";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/components/ui/stat-card";

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
          sessions.map((s) => (
            <SessionAgendaCard 
              key={s.id} 
              session={s} 
              onClick={() => router.push(`/me/schedule/${s.id}`)}
            />
          ))
        ) : (
          <div className="mt-8">
            <EmptyState description={`Không có ca dạy nào vào ngày ${selectedDate.toLocaleDateString('vi-VN')}`} />
          </div>
        )}
      </div>
    </div>
  );
}

function SessionAgendaCard({ session, onClick }: { session: any, onClick: () => void }) {
  const isCompleted = session.statusCode === 'COMPLETED';
  const isOngoing = session.statusCode === 'ONGOING';
  
  // Kiểm tra quá giờ (Past session)
  const sessionEndTime = new Date(`${session.sessionDate.split('T')[0]}T${session.endTime || '23:59:00'}`);
  const now = new Date();
  const isPast = sessionEndTime < now;

  const startTimeStr = session.startTime ? session.startTime.substring(0, 5) : '--:--';
  const endTimeStr = session.endTime ? session.endTime.substring(0, 5) : '--:--';

  // Determine styles based on status
  let borderColor = 'border-l-gray-300';
  let badgeColor = 'bg-gray-100 text-gray-600';
  let badgeText = 'Sắp tới';

  if (isCompleted) {
    borderColor = 'border-l-gray-300 opacity-60 bg-slate-50';
    badgeColor = 'bg-gray-200 text-gray-500';
    badgeText = 'Đã xong';
  } else if (isOngoing) {
    borderColor = 'border-l-blue-500 shadow-md border border-blue-50 bg-blue-50/30';
    badgeColor = 'bg-blue-100 text-blue-700 animate-pulse ring-1 ring-blue-400/50';
    badgeText = 'Đang diễn ra';
  } else if (isPast) {
    borderColor = 'border-l-red-400 opacity-80 bg-red-50/20';
    badgeColor = 'bg-red-100 text-red-600';
    badgeText = 'Đã qua';
  } else {
    borderColor = 'border-l-edu-accent shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-100 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.15)]';
    badgeColor = 'bg-edu-accentLight text-edu-accent';
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
        <div className="flex justify-between items-start mb-1.5">
          <h3 className={cn("font-bold truncate text-[15px] pr-2", isCompleted ? "text-slate-500" : "text-slate-800")}>
            {session.className || 'Lớp chưa đặt tên'}
          </h3>
          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap tracking-wide", badgeColor)}>
            {badgeText}
          </span>
        </div>
        
        <div className="text-[13px] font-semibold text-edu-accent truncate mb-3 flex items-center gap-1.5">
          <BookOpen size={14} className="opacity-70" />
          {session.lessonTitle || 'Chưa cập nhật chủ đề'}
        </div>

        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
            <MapPin size={12} className="text-slate-400" />
            <span className="truncate max-w-[90px]">{session.roomName || 'Chưa xếp phòng'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
            <Users size={12} className="text-slate-400" />
            <span>{session.actualStudentCount || 0} Học viên</span>
          </div>
        </div>
      </div>
    </div>
  );
}
