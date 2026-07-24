'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useProfileStats } from "@/hooks/queries/useProfile";
import { Suspense } from "react";
import { ChevronLeft, Loader2, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

function AttendanceStatsContent() {
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
          <h1 className="text-lg font-bold text-slate-800">Chi tiết Chuyên cần</h1>
          <div className="text-sm font-medium text-slate-500">{title}</div>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-amber-50 rounded-3xl p-5 mb-6 border border-amber-100 flex items-center justify-between">
        <div>
          <div className="text-3xl font-black text-amber-600">{statsData?.attendanceRate || 0}%</div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-wide mt-1">Tỷ lệ chuyên cần</div>
        </div>
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
          <CheckCircle2 size={24} className="text-amber-500" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Lịch sử Điểm danh</h2>
        
        {statsData?.sessions && statsData.sessions.length > 0 ? (
          statsData.sessions.map((session) => {
            const isOk = session.attendanceStatus === 'OK';
            const isLate = session.attendanceStatus === 'LATE';
            const isMissed = session.attendanceStatus === 'MISSED';
            const isUpcoming = session.attendanceStatus === 'UPCOMING';

            return (
              <div key={session.sessionId} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start gap-4 relative overflow-hidden">
                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  isOk ? 'bg-green-500' :
                  isLate ? 'bg-orange-500' :
                  isMissed ? 'bg-red-500' : 'bg-slate-300'
                }`} />
                
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isOk ? 'bg-green-50' :
                  isLate ? 'bg-orange-50' :
                  isMissed ? 'bg-red-50' : 'bg-slate-50'
                }`}>
                  {isOk && <CheckCircle2 size={20} className="text-green-500" />}
                  {isLate && <Clock size={20} className="text-orange-500" />}
                  {isMissed && <XCircle size={20} className="text-red-500" />}
                  {isUpcoming && <Clock size={20} className="text-slate-400" />}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-800 text-[15px] truncate pr-2">{session.className}</h3>
                    <span className="text-xs font-semibold text-slate-500 shrink-0">
                      {format(new Date(session.sessionDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-600 truncate mb-2">
                    {session.lessonTitle || 'Chưa cập nhật chủ đề'}
                  </div>
                  
                  {/* Badge */}
                  <div className="flex items-center gap-2">
                    {isOk && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-700">ĐÚNG GIỜ</span>
                    )}
                    {isLate && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-700 flex items-center gap-1">
                        <AlertTriangle size={12} /> TRỄ {session.lateMinutes} PHÚT (-{session.penaltyPercentage}%)
                      </span>
                    )}
                    {isMissed && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 flex items-center gap-1">
                        <XCircle size={12} /> VẮNG MẶT (-{session.penaltyPercentage}%)
                      </span>
                    )}
                    {isUpcoming && (
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

export default function AttendanceStatsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="animate-spin text-edu-accent" size={32} /></div>}>
      <AttendanceStatsContent />
    </Suspense>
  );
}
