import { MapPin, Clock, BookOpen, ChevronRight } from "lucide-react";

export default function TeacherDashboard() {
  return (
    <div className="space-y-6 mt-2">
      {/* Teacher Info */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#81C784] to-[#A5D6A7] flex items-center justify-center text-white font-bold text-lg">
          MA
        </div>
        <div>
          <h3 className="font-semibold text-edu-fg text-base">Nguyễn Thị Minh Anh</h3>
          <p className="text-xs text-edu-muted">GV — THCS Hoàng Diệu</p>
        </div>
      </div>

      {/* Checkin Action Box */}
      <div className="bg-white rounded-2xl border border-edu-border p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium bg-edu-successLight text-edu-success px-3 py-2 rounded-lg mb-4">
          <MapPin size={16} />
          <span>Vị trí hợp lệ: Đang ở THCS Hoàng Diệu (12m)</span>
        </div>
        
        <button className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-edu-accent to-[#7BC4FF] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-edu-accent/30 transition-all active:scale-[0.98]">
          Check-in Ca Dạy
        </button>
      </div>

      {/* Today's Schedule */}
      <div>
        <h4 className="font-semibold text-edu-fg mb-3 text-sm flex justify-between items-center">
          <span>Lịch dạy hôm nay</span>
          <span className="text-edu-accent cursor-pointer">Tất cả</span>
        </h4>
        
        <div className="space-y-3">
          <SessionCard 
            time="07:30" 
            cls="Lớp 8/2" 
            school="THCS Hoàng Diệu" 
            lesson="Unit 5: Environment" 
            status="completed" 
          />
          <SessionCard 
            time="13:30" 
            cls="Lớp 10A1" 
            school="THPT Trần Phú" 
            lesson="Unit 7: Literature" 
            status="upcoming" 
          />
        </div>
      </div>
    </div>
  );
}

function SessionCard({ time, cls, school, lesson, status }: { time: string, cls: string, school: string, lesson: string, status: 'completed' | 'upcoming' }) {
  const isCompleted = status === 'completed';
  return (
    <div className={\`flex gap-4 p-4 rounded-xl border transition-all active:bg-edu-accentLighter \${isCompleted ? 'bg-edu-bg border-transparent opacity-80' : 'bg-white border-edu-border border-l-4 border-l-edu-accent shadow-sm'}\`}>
      <div className={\`text-sm font-bold mt-0.5 \${isCompleted ? 'text-edu-muted' : 'text-edu-accent'}\`}>
        {time}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-edu-fg text-sm mb-0.5">{cls} — {school}</div>
        <div className="text-xs text-edu-muted flex items-center gap-1.5 mb-2">
          <BookOpen size={12} />
          <span className="truncate max-w-[200px]">{lesson}</span>
        </div>
        <div className="flex gap-2 mt-2">
          {isCompleted ? (
            <span className="text-[0.65rem] font-bold px-2 py-1 bg-edu-successLight text-edu-success rounded-md">Đã hoàn thành</span>
          ) : (
            <span className="text-[0.65rem] font-bold px-2 py-1 bg-edu-accentLight text-edu-accent rounded-md">Sắp diễn ra</span>
          )}
        </div>
      </div>
    </div>
  );
}
