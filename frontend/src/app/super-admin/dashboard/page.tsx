import { Building2, Users, Calendar, UserCheck, MapPin, Clock } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

export default function SuperAdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Dashboard</h2>
        <p className="text-edu-muted text-sm">Tổng quan hệ thống EduOps — Hôm nay, {new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-7">
        <StatCard icon={<Building2 size={20} />} label="Tổng trung tâm" value="7" change="+2 tháng này" type="accent" />
        <StatCard icon={<Users size={20} />} label="Tổng giáo viên" value="185" change="+12 tháng này" type="success" />
        <StatCard icon={<Calendar size={20} />} label="Ca hôm nay" value="42" type="warn" />
        <StatCard icon={<UserCheck size={20} />} label="Active Users" value="156" change="84% online" type="accent" />
        <StatCard icon={<MapPin size={20} />} label="Check-in hôm nay" value="38" type="success" />
        <StatCard icon={<Clock size={20} />} label="Tỷ lệ đi trễ" value="7.2%" change="+0.8% so tuần trước" type="danger" />
      </div>

      {/* GRID 2-1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-edu-border p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-5">
            <span className="font-semibold text-base text-edu-fg">Usage theo tháng</span>
            <span className="bg-edu-accentLight text-edu-accent px-2.5 py-1 rounded-full text-xs font-bold">6 tháng</span>
          </div>
          <div className="h-60 rounded-lg relative overflow-hidden flex items-end gap-1.5 pb-7 pt-5">
            {/* Chart Bars Placeholder */}
            {[40, 50, 70, 85, 95, 120].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-edu-accent to-[#7BC4FF] rounded-t-sm hover:opacity-85 transition-opacity relative group" style={{ height: `\${(h/120)*100}%` }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-edu-fg opacity-0 group-hover:opacity-100 transition-opacity">{h}</span>
              </div>
            ))}
            <div className="absolute bottom-0 left-0 right-0 flex justify-around text-[0.65rem] text-edu-muted px-1">
              <span>T1</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-edu-border p-6 hover:shadow-md transition-shadow">
          <div className="font-semibold text-base text-edu-fg mb-4">Tăng trưởng User</div>
          <div className="flex flex-col gap-3 mt-2">
            {[{m:'T1',v:89},{m:'T2',v:102},{m:'T3',v:118},{m:'T4',v:134},{m:'T5',v:152},{m:'T6',v:178}].map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-edu-muted w-6">{d.m}</span>
                <div className="flex-1 h-2 bg-edu-bg rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-edu-accent to-[#7BC4FF] rounded-full" style={{ width: `\${d.v/2}%` }}></div>
                </div>
                <span className="text-xs font-semibold w-9 text-right text-edu-fg">{d.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

