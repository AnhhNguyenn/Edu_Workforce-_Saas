'use client';

import { BookOpen, User, Loader2, ChevronRight } from "lucide-react";
import { useSessions } from "@/hooks/queries/useSessions";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SchedulePage() {
  const router = useRouter();
  const { data: sessionData, isLoading } = useSessions();
  // In a real app we might have a date picker, but here we just show all sessions retrieved
  const sessions = sessionData?.items || [];

  return (
    <div className="space-y-4 pt-4">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-edu-fg">Lịch dạy của tôi</h2>
        <p className="text-xs text-edu-muted">Bấm vào từng ca để điểm danh hoặc xem chi tiết</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-edu-accent" size={32} /></div>
      ) : sessions.length > 0 ? (
        sessions.map((s) => {
          const isCompleted = s.statusCode === 'COMPLETED';
          return (
            <div 
              key={s.id} 
              onClick={() => router.push(`/teacher/schedule/${s.id}/attendance`)}
              className={`bg-white rounded-xl border border-edu-border p-4 shadow-sm relative overflow-hidden cursor-pointer hover:border-edu-accent transition-colors ${isCompleted ? 'opacity-80' : ''}`}
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full ${isCompleted ? 'bg-gray-400' : 'bg-edu-accent'}`}></div>
              
              <div className="flex justify-between items-start mb-2 pl-2">
                <div>
                  <span className="font-bold text-lg text-edu-accent">{s.startTime?.substring(0, 5)}</span>
                  <span className="text-xs text-edu-muted ml-2">{new Date(s.sessionDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <Badge variant={isCompleted ? 'success' : s.statusCode === 'ONGOING' ? 'info' : 'muted'}>
                  {isCompleted ? 'Đã xong' : s.statusCode === 'ONGOING' ? 'Đang diễn ra' : 'Sắp tới'}
                </Badge>
              </div>
              
              <div className="pl-2 space-y-1">
                <div className="font-bold text-edu-fg text-sm">Mã lớp: {s.classId?.substring(0, 8) ?? 'N/A'}...</div>
                <div className="text-xs text-edu-muted flex items-center justify-between">
                   <div className="flex items-center gap-1.5">
                     <BookOpen size={14} className="text-edu-muted" />
                     <span className="truncate max-w-[200px]">{s.lessonTitle || 'Chưa cập nhật chủ đề'}</span>
                   </div>
                   <ChevronRight size={16} className="text-edu-muted opacity-50" />
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <EmptyState description="Không có lịch dạy nào" />
      )}
    </div>
  );
}

