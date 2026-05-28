import { TODAY_SESSIONS, statusBadgeInfo } from "@/lib/mock-data";
import { BookOpen } from "lucide-react";

export default function SchedulePage() {
  const teacherSessions = TODAY_SESSIONS.filter(s => s.teacher === 'Nguyễn Thị Minh Anh' || s.assistant === 'Lê Thu Trang');

  return (
    <div className="space-y-4 pt-4">
      {teacherSessions.length > 0 ? (
        teacherSessions.map((s, i) => {
          const badge = statusBadgeInfo(s.status);
          const isCompleted = s.status === 'completed';
          return (
            <div key={i} className={`bg-white rounded-xl border border-edu-border p-4 shadow-sm relative overflow-hidden \${isCompleted ? 'opacity-80' : ''}`}>
              <div className="absolute top-0 left-0 w-1.5 h-full bg-edu-accent"></div>
              
              <div className="flex justify-between items-start mb-2 pl-2">
                <span className="font-bold text-lg text-edu-accent">{s.time}</span>
                <span className={`text-[0.65rem] font-bold px-2.5 py-1 rounded-md \${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
              
              <div className="pl-2 space-y-1">
                <div className="font-bold text-edu-fg text-sm">{s.cls} — {s.school}</div>
                <div className="text-xs text-edu-muted flex items-center gap-1.5">
                  <span className="text-base">👩‍🏫</span>
                  <span>{s.teacher}</span>
                </div>
                <div className="text-xs text-edu-muted flex items-center gap-1.5">
                  <BookOpen size={14} className="text-edu-muted" />
                  <span>{s.lesson}</span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center text-edu-muted py-10">
          Không có lịch dạy hôm nay
        </div>
      )}
    </div>
  );
}

