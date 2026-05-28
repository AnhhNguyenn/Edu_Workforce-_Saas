import { ORGANIZATIONS, COLORS, getAvatarInitials, statusBadgeInfo } from "@/lib/mock-data";
import { Plus, Search } from "lucide-react";

export default function OrganizationsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Organizations</h2>
          <p className="text-edu-muted text-sm">Quản lý toàn bộ trung tâm trong hệ thống</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-edu-accent text-white rounded-lg font-medium hover:bg-edu-accentHover transition-colors shadow-sm hover:shadow-md">
          <Plus size={18} />
          Tạo trung tâm
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border">
          <h3 className="font-semibold text-edu-fg flex items-center gap-2">
            Danh sách trung tâm
            <span className="bg-edu-accentLight text-edu-accent text-xs px-2.5 py-0.5 rounded-full font-bold">
              {ORGANIZATIONS.length}
            </span>
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={14} />
            <input 
              type="text" 
              placeholder="Tìm trung tâm..." 
              className="w-[220px] py-1.5 pr-3 pl-8 rounded-lg border border-edu-border text-sm focus:border-edu-accent focus:ring-1 focus:ring-edu-accent outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-edu-bg">
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Trung tâm</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Thành phố</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Plan</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Giáo viên</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Hết hạn</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Trạng thái</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {ORGANIZATIONS.map((o, i) => {
                const badge = statusBadgeInfo(o.status);
                return (
                  <tr key={i} className="hover:bg-edu-accentLighter transition-colors group">
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: COLORS[i % 8] }}
                        >
                          {getAvatarInitials(o.name)}
                        </div>
                        <span className="font-semibold text-edu-fg">{o.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm text-edu-fgSecondary">{o.city}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm">
                      <span className="bg-edu-accentLight text-edu-accent font-semibold text-[0.75rem] px-2.5 py-1 rounded-full">
                        {o.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm font-medium text-edu-fg">{o.teachers}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm text-edu-fgSecondary">{o.expires}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <span className={\`font-semibold text-[0.75rem] px-2.5 py-1 rounded-full \${badge.cls}\`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-right">
                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-edu-border text-edu-fg hover:border-edu-accent hover:text-edu-accent transition-colors">
                          Chi tiết
                        </button>
                        <button className={\`px-3 py-1.5 rounded-md text-xs font-semibold \${o.status === 'active' ? 'bg-edu-dangerLight text-edu-danger hover:bg-edu-danger hover:text-white' : 'bg-edu-successLight text-edu-success hover:bg-edu-success hover:text-white'} transition-colors\`}>
                          {o.status === 'active' ? 'Khóa' : 'Mở'}
                        </button>
                      </div>
                    </td>
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
