import { VIETNAMESE_TEACHERS, COLORS, getAvatarInitials } from "@/lib/mock-data";
import { BarChart3, CheckCircle2, Clock, FileText } from "lucide-react";

export default function AnalyticsPage() {
  const topTeachers = VIETNAMESE_TEACHERS.filter(t => t.role === 'teacher').sort((a,b) => b.attendance - a.attendance).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Analytics</h2>
        <p className="text-edu-muted text-sm">Phân tích hiệu suất toàn hệ thống</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard icon={<BarChart3 size={20} />} label="Tổng sessions tháng" value="1,247" type="accent" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Attendance rate" value="94.3%" type="success" />
        <StatCard icon={<Clock size={20} />} label="Tỷ lệ đi trễ" value="7.2%" type="warn" />
        <StatCard icon={<FileText size={20} />} label="Report submitted" value="91.8%" type="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-edu-border hover:shadow-md transition-shadow">
          <div className="font-semibold text-base text-edu-fg mb-4">Sessions theo ngày</div>
          <div className="h-52 rounded-lg relative overflow-hidden flex items-end gap-1.5 pb-7 pt-5">
            {[40, 50, 70, 85, 95, 120, 60].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-edu-accent to-[#7BC4FF] rounded-t-sm hover:opacity-85 transition-opacity" style={{ height: \`\${(h/120)*100}%\` }}></div>
            ))}
            <div className="absolute bottom-0 left-0 right-0 flex justify-around text-[0.65rem] text-edu-muted px-1 font-semibold">
              <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-edu-border hover:shadow-md transition-shadow">
          <div className="font-semibold text-base text-edu-fg mb-4">Top giáo viên xuất sắc</div>
          <div className="flex flex-col">
            {topTeachers.map((t, i) => (
              <div key={i} className={\`flex items-center gap-3 py-2.5 \${i < 4 ? 'border-b border-edu-border' : ''}\`}>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: COLORS[i % 8] }}
                >
                  {getAvatarInitials(t.name)}
                </div>
                <span className="flex-1 text-sm font-semibold text-edu-fg">{t.name}</span>
                <span className="bg-edu-successLight text-edu-success text-xs font-bold px-2.5 py-1 rounded-full">
                  {t.attendance}%
                </span>
              </div>
            ))}
          </div>
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
