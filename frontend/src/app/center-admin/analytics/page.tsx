import React from 'react';
import { VIETNAMESE_TEACHERS, COLORS, getAvatarInitials } from "@/lib/mock-data";
import { CalendarDays, CheckCircle2, Clock, FileText } from "lucide-react";

export default function AnalyticsPage() {
  const topTeachers = VIETNAMESE_TEACHERS.filter(t => t.status === 'active').slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Analytics</h2>
        <p className="text-edu-muted text-sm">Phân tích hiệu suất trung tâm</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard icon={<CalendarDays size={20} />} label="Sessions tháng" value="156" type="accent" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Attendance rate" value="93.2%" type="success" />
        <StatCard icon={<Clock size={20} />} label="Đi trễ" value="6.8%" type="warn" />
        <StatCard icon={<FileText size={20} />} label="Report submitted" value="94%" type="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-edu-border hover:shadow-md transition-shadow">
          <div className="font-semibold text-base text-edu-fg mb-4">Performance theo giáo viên</div>
          <div className="flex flex-col">
            {topTeachers.map((t, i) => (
              <div key={i} className={`flex justify-between items-center py-3 \${i < 5 ? 'border-b border-edu-border' : ''}`}>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: COLORS[i % 8] }}
                  >
                    {getAvatarInitials(t.name)}
                  </div>
                  <span className="text-sm font-semibold text-edu-fg">{t.name}</span>
                </div>
                
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-edu-muted">Buổi: <strong className="text-edu-fg">{t.sessions}</strong></span>
                  <span className="text-edu-muted">Trễ: <strong className={t.late > 5 ? 'text-edu-danger' : 'text-edu-fg'}>{t.late}</strong></span>
                  <span className={`font-bold px-2 py-0.5 rounded-md \${t.attendance >= 95 ? 'bg-edu-successLight text-edu-success' : t.attendance >= 85 ? 'bg-edu-warnLight text-edu-warn' : 'bg-edu-dangerLight text-edu-danger'}`}>
                    {t.attendance}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-edu-border hover:shadow-md transition-shadow">
          <div className="font-semibold text-base text-edu-fg mb-4">Sessions theo tuần</div>
          <div className="h-56 rounded-lg relative overflow-hidden flex items-end gap-1.5 pb-7 pt-5">
            {[60, 80, 50, 100, 90, 110].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-edu-accent to-[#7BC4FF] rounded-t-sm hover:opacity-85 transition-opacity" style={{ height: `\${(h/120)*100}%` }}></div>
            ))}
            <div className="absolute bottom-0 left-0 right-0 flex justify-around text-[0.65rem] text-edu-muted px-1 font-semibold">
              <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span>
            </div>
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
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-edu-border hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden after:content-[''] after:absolute after:-top-5 after:-right-5 after:w-20 after:h-20 after:rounded-full after:opacity-10 \${c.circle}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 \${c.bg} \${c.text}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold leading-tight text-edu-fg">{value}</div>
      <div className="text-xs text-edu-muted mt-1">{label}</div>
    </div>
  );
}

