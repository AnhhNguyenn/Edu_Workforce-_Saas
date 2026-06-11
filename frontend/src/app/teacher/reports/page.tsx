'use client';

import { ClipboardCheck, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessions } from "@/hooks/queries/useSessions";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { useProfile } from "@/hooks/queries/useProfile";

export default function TeacherReportsPage() {
  const router = useRouter();
  const { data: profile } = useProfile();
  
  // Lấy tất cả session (thực tế có thể thêm tham số query để lấy 30 ngày gần nhất)
  const { data: sessionData, isLoading } = useSessions();
  const sessions = sessionData?.items || [];
  
  // Ca học COMPLETED mới cho phép viết report
  const completedSessions = sessions.filter(s => s.statusCode === 'COMPLETED');

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-edu-accent" size={32} /></div>;
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-edu-fg">Nộp báo cáo</h2>
        <p className="text-xs text-edu-muted">Chọn ca học đã kết thúc để nộp báo cáo nhận xét</p>
      </div>

      {completedSessions.length === 0 ? (
        <EmptyState description="Chưa có ca học nào cần báo cáo. Bạn chỉ có thể nộp báo cáo sau khi kết thúc ca học hoặc điểm danh hoàn tất." />
      ) : (
        <div className="space-y-3">
          {completedSessions.map(session => (
            <div 
              key={session.id}
              onClick={() => router.push(`/teacher/reports/${session.id}`)}
              className="bg-white rounded-xl border border-edu-border p-4 shadow-sm cursor-pointer hover:border-edu-accent transition-colors flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-edu-fg text-sm mb-1 truncate max-w-[200px]" title={session.lessonTitle}>{session.lessonTitle || 'Chưa có chủ đề'}</div>
                <div className="text-xs text-edu-muted flex gap-2">
                  <span>Mã lớp: {session.classId?.substring(0, 8) ?? 'N/A'}...</span>
                  <span>•</span>
                  <span>{new Date(session.sessionDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              <div className="bg-edu-accentLight text-edu-accent p-2 rounded-full">
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
