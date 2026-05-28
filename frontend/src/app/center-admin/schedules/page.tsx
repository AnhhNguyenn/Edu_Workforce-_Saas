'use client';

import { TODAY_SESSIONS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function SchedulesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Lịch giảng dạy</h2>
          <p className="text-edu-muted text-sm">Theo dõi lịch dạy thực tế của giáo viên trong ngày</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden p-6">
        <h3 className="font-semibold text-lg text-edu-fg mb-4">Hôm nay ({new Date().toLocaleDateString('vi-VN')})</h3>
        
        <div className="space-y-4">
          {TODAY_SESSIONS.map((s, i) => (
            <div key={i} className="flex gap-4 p-4 border border-edu-border rounded-xl hover:border-[#4CAF50] transition-colors relative">
               {s.status === 'in_progress' && (
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4CAF50] rounded-l-xl"></div>
               )}
               <div className="w-20 text-center border-r border-dashed border-edu-border pr-4 flex flex-col justify-center">
                 <div className="text-xl font-bold text-edu-fg">{s.time}</div>
               </div>
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                   <h4 className="font-bold text-[#2E7D32] text-lg">{s.cls}</h4>
                   <Badge variant={s.status === 'completed' ? 'success' : s.status === 'in_progress' ? 'info' : 'muted'}>
                     {s.status === 'completed' ? 'Đã xong' : s.status === 'in_progress' ? 'Đang diễn ra' : 'Sắp tới'}
                   </Badge>
                 </div>
                 <div className="text-sm text-edu-fgSecondary mb-1">
                   <span className="font-medium">Giáo viên:</span> {s.teacher}
                 </div>
                 <div className="text-sm text-edu-fgSecondary mb-1">
                   <span className="font-medium">Bài học:</span> {s.lesson}
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
