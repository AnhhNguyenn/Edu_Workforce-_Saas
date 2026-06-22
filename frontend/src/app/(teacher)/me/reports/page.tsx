'use client';

import { ClipboardCheck, Loader2, ChevronRight, Calendar, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useSessions } from "@/hooks/queries/useSessions";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { useProfile } from "@/hooks/queries/useProfile";

export default function TeacherReportsPage() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'discipline'>('day');
  
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
        <p className="text-xs text-edu-muted">Cập nhật tiến độ bài giảng và nhận xét lớp học</p>
      </div>

      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-edu-border mb-4 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('day')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all ${activeTab === 'day' ? 'bg-edu-accent text-white shadow-md' : 'text-edu-muted hover:text-edu-fg hover:bg-edu-accentLighter'}`}
        >
          <ClipboardCheck size={16} /> Báo cáo Ngày
        </button>
        <button
          onClick={() => setActiveTab('week')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all ${activeTab === 'week' ? 'bg-edu-accent text-white shadow-md' : 'text-edu-muted hover:text-edu-fg hover:bg-edu-accentLighter'}`}
        >
          <Calendar size={16} /> Báo cáo Tuần
        </button>
        <button
          onClick={() => setActiveTab('discipline')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all ${activeTab === 'discipline' ? 'bg-red-500 text-white shadow-md' : 'text-edu-muted hover:text-red-500 hover:bg-red-50'}`}
        >
          <AlertCircle size={16} /> Kỷ luật
        </button>
      </div>

      {activeTab === 'day' && (
        <>
          {completedSessions.length === 0 ? (
            <EmptyState description="Chưa có ca học nào cần báo cáo. Bạn chỉ có thể nộp báo cáo sau khi kết thúc ca học hoặc điểm danh hoàn tất." />
          ) : (
            <div className="space-y-3">
              {completedSessions.map(session => (
                <div 
                  key={session.id}
                  onClick={() => router.push(`/me/reports/${session.id}`)}
                  className="bg-white rounded-xl border border-edu-border p-4 shadow-sm cursor-pointer hover:border-edu-accent transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-edu-fg text-sm mb-1 truncate max-w-[250px]" title={session.lessonTitle}>{session.lessonTitle || 'Chưa có chủ đề'}</div>
                    <div className="text-xs text-edu-muted flex gap-2">
                      <span className="font-semibold text-edu-accent">{session.className || `Lớp ${session.classId?.substring(0, 5)}`}</span>
                      <span>•</span>
                      <span>{new Date(session.sessionDate).toLocaleDateString('vi-VN')}</span>
                      <span>•</span>
                      <span>{session.startTime.substring(0,5)} - {session.endTime.substring(0,5)}</span>
                    </div>
                  </div>
                  <div className="bg-edu-accentLight text-edu-accent p-2 rounded-full shrink-0">
                    <ChevronRight size={18} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'week' && (
        <EmptyState description="Tính năng Báo cáo tuần đang được cập nhật." />
      )}

      {activeTab === 'discipline' && (
        <EmptyState description="Chưa có báo cáo kỷ luật nào trong tuần này." />
      )}
    </div>
  );
}
