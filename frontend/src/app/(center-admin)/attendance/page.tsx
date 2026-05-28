import { statusBadgeInfo } from "@/lib/mock-data";
import { CheckCircle2, Clock, HelpCircle, MapPin, Download } from "lucide-react";

export default function AttendancePage() {
  const ATTENDANCE = [
    {teacher:'Nguyễn Thị Minh Anh',cls:'Lớp 8/2',time:'07:30',ci:'07:22',co:'09:35',status:'on_time',gps:'✅'},
    {teacher:'Trần Văn Hùng',cls:'Lớp 3A',time:'09:00',ci:'09:18',co:'—',status:'late',gps:'✅'},
    {teacher:'Ngô Thanh Tùng',cls:'Lớp 10A1',time:'13:30',ci:'12:58',co:'—',status:'on_time',gps:'✅'},
    {teacher:'Phạm Đức Minh',cls:'Lớp Lá A',time:'15:00',ci:'—',co:'—',status:'upcoming',gps:'—'},
    {teacher:'Hoàng Thị Thu Hà',cls:'Lớp 7/1',time:'17:30',ci:'—',co:'—',status:'upcoming',gps:'—'},
    {teacher:'Vũ Thị Bích Ngọc',cls:'Lớp 9/3',time:'18:00',ci:'—',co:'—',status:'upcoming',gps:'—'}
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Attendance</h2>
        <p className="text-edu-muted text-sm">Giám sát điểm danh real-time hôm nay</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard icon={<CheckCircle2 size={20} />} label="On time" value="3" type="success" />
        <StatCard icon={<Clock size={20} />} label="Đi trễ" value="1" type="danger" />
        <StatCard icon={<HelpCircle size={20} />} label="Chưa check-in" value="2" type="warn" />
        <StatCard icon={<MapPin size={20} />} label="GPS hợp lệ" value="4" type="accent" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border">
          <h3 className="font-semibold text-edu-fg">Chi tiết hôm nay</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-edu-border text-edu-fg rounded-lg text-sm font-semibold hover:border-edu-accent hover:text-edu-accent transition-colors">
            <Download size={16} />
            Export Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-edu-bg">
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Giáo viên</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Lớp</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Giờ học</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Check-in</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Check-out</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Trạng thái</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border text-center">GPS</th>
              </tr>
            </thead>
            <tbody>
              {ATTENDANCE.map((a, i) => {
                const badge = statusBadgeInfo(a.status);
                return (
                  <tr key={i} className="hover:bg-edu-accentLighter transition-colors">
                    <td className="py-3.5 px-5 border-b border-edu-border font-semibold text-edu-fg whitespace-nowrap">{a.teacher}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm">{a.cls}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm font-bold text-edu-accent">{a.time}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm">{a.ci}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm">{a.co}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <span className={\`font-semibold text-[0.75rem] px-2.5 py-1 rounded-full \${badge.cls}\`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-center">{a.gps}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
    <div className={\`bg-white rounded-2xl p-5 shadow-sm border border-edu-border hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden after:content-[''] after:absolute after:-top-5 after:-right-5 after:w-20 after:h-20 after:rounded-full after:opacity-10 \${c.circle}\`}>
      <div className={\`w-10 h-10 rounded-lg flex items-center justify-center mb-3 \${c.bg} \${c.text}\`}>
        {icon}
      </div>
      <div className="text-3xl font-bold leading-tight text-edu-fg">{value}</div>
      <div className="text-xs text-edu-muted mt-1">{label}</div>
    </div>
  );
}
