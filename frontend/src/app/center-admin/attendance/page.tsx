'use client';

import { CheckCircle2, Clock, HelpCircle, MapPin, Download } from "lucide-react";
import { useSessions } from "@/hooks/queries/useSessions";
import { Badge } from "@/components/ui/badge";

export default function AttendancePage() {
  const { data: sessions, isLoading } = useSessions();
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions?.items?.filter(s => s.sessionDate.startsWith(today)) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Attendance</h2>
        <p className="text-edu-muted text-sm">Giám sát điểm danh real-time hôm nay</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard icon={<CheckCircle2 size={20} />} label="Ca học hôm nay" value={todaySessions.length.toString()} type="success" />
        <StatCard icon={<Clock size={20} />} label="Đã hoàn thành" value={todaySessions.filter(s => s.statusCode === 'COMPLETED').length.toString()} type="accent" />
        <StatCard icon={<HelpCircle size={20} />} label="Chưa bắt đầu" value={todaySessions.filter(s => s.statusCode === 'SCHEDULED').length.toString()} type="warn" />
        <StatCard icon={<MapPin size={20} />} label="Đang diễn ra" value={todaySessions.filter(s => s.statusCode === 'ONGOING').length.toString()} type="danger" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border">
          <h3 className="font-semibold text-edu-fg">Chi tiết điểm danh giảng dạy</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-edu-border text-edu-fg rounded-lg text-sm font-semibold hover:border-edu-accent hover:text-edu-accent transition-colors">
            <Download size={16} />
            Export Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-10 text-edu-muted">Đang tải dữ liệu điểm danh...</div>
          ) : todaySessions.length === 0 ? (
            <div className="text-center py-10 text-edu-muted">Không có ca học nào trong hôm nay.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-edu-bg">
                  <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Mã Lớp</th>
                  <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Chủ đề</th>
                  <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Giờ học</th>
                  <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Check-in</th>
                  <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Check-out</th>
                  <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Trạng thái ca học</th>
                </tr>
              </thead>
              <tbody>
                {todaySessions.map((s) => (
                  <tr key={s.id} className="hover:bg-edu-accentLighter transition-colors">
                    <td className="py-3.5 px-5 border-b border-edu-border font-semibold text-edu-fg whitespace-nowrap">{s.classId.substring(0, 8)}...</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm">{s.lessonTitle || '---'}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm font-bold text-edu-accent">{s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm text-edu-muted">Đang cập nhật</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm text-edu-muted">Đang cập nhật</td>
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <Badge variant={s.statusCode === 'COMPLETED' ? 'success' : s.statusCode === 'ONGOING' ? 'info' : 'muted'}>
                        {s.statusCode === 'COMPLETED' ? 'Đã xong' : s.statusCode === 'ONGOING' ? 'Đang diễn ra' : 'Sắp tới'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, type }: { icon: React.ReactNode, label: string, value: string, type: 'accent' | 'success' | 'warn' | 'danger' }) {
  const colors = {
    accent: { bg: 'bg-edu-accentLight', text: 'text-edu-accent', circle: 'after:bg-edu-accent' },
    success: { bg: 'bg-edu-successLight', text: 'text-edu-success', circle: 'after:bg-edu-success' },
    warn: { bg: 'bg-edu-warnLight', text: 'text-edu-warn', circle: 'after:bg-edu-warn' },
    danger: { bg: 'bg-edu-dangerLight', text: 'text-edu-danger', circle: 'after:bg-edu-danger' },
  };
  const c = colors[type];

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-edu-border hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden after:content-[''] after:absolute after:-top-5 after:-right-5 after:w-20 after:h-20 after:rounded-full after:opacity-10 ${c.circle}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold leading-tight text-edu-fg">{value}</div>
      <div className="text-xs text-edu-muted mt-1">{label}</div>
    </div>
  );
}

