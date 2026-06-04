'use client';

import { ClipboardCheck, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessions } from "@/hooks/queries/useSessions";
import { useRouter } from "next/navigation";
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
        <div className="bg-white rounded-2xl shadow-sm border border-edu-border p-6 text-center mt-6">
          <div className="w-16 h-16 bg-edu-accentLight text-edu-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck size={32} />
          </div>
          <h3 className="font-bold text-lg mb-2">Chưa có ca học nào cần báo cáo</h3>
          <p className="text-sm text-edu-muted mb-6">Bạn chỉ có thể nộp báo cáo sau khi kết thúc ca học hoặc điểm danh hoàn tất.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {completedSessions.map(session => (
            <div 
              key={session.id}
              onClick={() => router.push(`/teacher/reports/${session.id}`)}
              className="bg-white rounded-xl border border-edu-border p-4 shadow-sm cursor-pointer hover:border-edu-accent transition-colors flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-edu-fg text-sm mb-1">{session.lessonTitle || 'Chưa có chủ đề'}</div>
                <div className="text-xs text-edu-muted flex gap-2">
                  <span>Mã lớp: {session.classId.substring(0, 8)}...</span>
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
