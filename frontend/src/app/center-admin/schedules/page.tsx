'use client';

import { useSessions } from "@/hooks/queries/useSessions";
import { Badge } from "@/components/ui/badge";

export default function SchedulesPage() {
  const { data: sessions, isLoading } = useSessions();
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions?.items?.filter(s => s.sessionDate.startsWith(today)) || [];

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
        
        {isLoading ? (
          <div className="text-center py-10 text-edu-muted">Đang tải lịch giảng dạy...</div>
        ) : todaySessions.length === 0 ? (
          <div className="text-center py-10 text-edu-muted border border-dashed border-edu-border rounded-xl">
            Không có ca học nào được xếp lịch trong hôm nay.
          </div>
        ) : (
          <div className="space-y-4">
            {todaySessions.map((s, i) => (
              <div key={s.id} className="flex gap-4 p-4 border border-edu-border rounded-xl hover:border-[#4CAF50] transition-colors relative">
                 {s.statusCode === 'ONGOING' && (
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4CAF50] rounded-l-xl"></div>
                 )}
                 <div className="w-20 text-center border-r border-dashed border-edu-border pr-4 flex flex-col justify-center">
                   <div className="text-lg font-bold text-edu-fg">{s.startTime.substring(0, 5)}</div>
                   <div className="text-sm text-edu-muted">{s.endTime.substring(0, 5)}</div>
                 </div>
                 <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                     <h4 className="font-bold text-[#2E7D32] text-lg">Mã lớp: {s.classId.substring(0, 8)}...</h4>
                     <Badge variant={s.statusCode === 'COMPLETED' ? 'success' : s.statusCode === 'ONGOING' ? 'info' : 'muted'}>
                       {s.statusCode === 'COMPLETED' ? 'Đã xong' : s.statusCode === 'ONGOING' ? 'Đang diễn ra' : 'Sắp tới'}
                     </Badge>
                   </div>
                   <div className="text-sm text-edu-fgSecondary mb-1">
                     <span className="font-medium">Chủ đề:</span> {s.lessonTitle || 'Chưa cập nhật'}
                   </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
