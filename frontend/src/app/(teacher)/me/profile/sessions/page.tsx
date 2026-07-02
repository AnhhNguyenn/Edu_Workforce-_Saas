'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useProfileStats } from "@/hooks/queries/useProfile";
import { ChevronLeft, Loader2, BarChart2, BookOpen, Clock, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default function SessionsStatsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const month = searchParams.get('month') ? parseInt(searchParams.get('month') as string) : undefined;
  const year = searchParams.get('year') ? parseInt(searchParams.get('year') as string) : undefined;
  
  const { data: statsData, isLoading } = useProfileStats(month, year);

  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="animate-spin text-edu-accent" size={32} /></div>;
  }

  const title = (month && year) ? `Tháng ${month}/${year}` : "Tất cả thời gian";

  return (
    <div className="pb-24 md:pb-8 max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-700" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Thống kê Buổi dạy</h1>
          <div className="text-sm font-medium text-slate-500">{title}</div>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-blue-50 rounded-3xl p-5 mb-6 border border-blue-100 flex items-center justify-between">
        <div>
          <div className="text-3xl font-black text-blue-600">{statsData?.totalSessions || 0}</div>
          <div className="text-xs font-bold text-blue-500 uppercase tracking-wide mt-1">Tổng buổi dạy</div>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <BarChart2 size={24} className="text-blue-500" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Danh sách buổi dạy</h2>
        
        {statsData?.sessions && statsData.sessions.length > 0 ? (
          statsData.sessions.map((session) => {
            const isCompleted = session.sessionStatus === 'COMPLETED' || session.sessionStatus === 'FINISHED';
            const isOngoing = session.sessionStatus === 'ONGOING';
            
            return (
              <div key={session.sessionId} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start gap-4">
                {/* Date Box */}
                <div className="w-12 h-14 rounded-xl bg-slate-50 flex flex-col items-center justify-center shrink-0 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    {format(new Date(session.sessionDate), 'MMM')}
                  </div>
                  <div className="text-lg font-black text-slate-700 leading-tight">
                    {format(new Date(session.sessionDate), 'dd')}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-800 text-[15px] truncate pr-2">{session.className}</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500">
                      {session.startTime.substring(0,5)} - {session.endTime.substring(0,5)}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-600 truncate mb-2">
                    {session.lessonTitle || 'Chưa cập nhật chủ đề'}
                  </div>
                  
                  {/* Badge */}
                  <div>
                    {isCompleted ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-700">ĐÃ DẠY XONG</span>
                    ) : isOngoing ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700">ĐANG DIỄN RA</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">SẮP TỚI</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <p className="text-slate-500 font-medium">Không có dữ liệu ca dạy nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
