import { VIETNAMESE_TEACHERS, COLORS, getAvatarInitials, statusBadgeInfo } from "@/lib/mock-data";
import { Plus, Search } from "lucide-react";

export default function TeachersPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Teachers</h2>
          <p className="text-edu-muted text-sm">Quản lý giáo viên & trợ giảng</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-edu-border text-edu-fg rounded-lg font-medium hover:border-edu-accent hover:text-edu-accent transition-colors shadow-sm">
            <Plus size={18} />
            Trợ giảng
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-edu-accent text-white rounded-lg font-medium hover:bg-edu-accentHover transition-colors shadow-sm hover:shadow-md">
            <Plus size={18} />
            Giáo viên
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border">
          <h3 className="font-semibold text-edu-fg flex items-center gap-2">
            Danh sách
            <span className="bg-edu-accentLight text-edu-accent text-xs px-2.5 py-0.5 rounded-full font-bold">
              {VIETNAMESE_TEACHERS.length}
            </span>
          </h3>
          <div className="flex gap-2">
            <select className="px-3 py-1.5 rounded-lg border border-edu-border text-sm outline-none focus:border-edu-accent bg-edu-bg">
              <option>Tất cả role</option>
              <option>Giáo viên</option>
              <option>Trợ giảng</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={14} />
              <input 
                type="text" 
                placeholder="Tìm giáo viên..." 
                className="w-[200px] py-1.5 pr-3 pl-8 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none bg-edu-bg focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-edu-bg">
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Giáo viên</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Role</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Trường</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Số buổi</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Attendance</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Đi trễ</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Trạng thái</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {VIETNAMESE_TEACHERS.map((t, i) => {
                const badge = statusBadgeInfo(t.status);
                return (
                  <tr key={i} className="hover:bg-edu-accentLighter transition-colors">
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: COLORS[i % 8] }}
                        >
                          {getAvatarInitials(t.name)}
                        </div>
                        <span className="font-semibold text-edu-fg">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <span className={\`font-semibold text-[0.75rem] px-2 py-0.5 rounded-md \${t.role === 'teacher' ? 'bg-edu-accentLight text-edu-accent' : 'bg-gray-100 text-edu-muted'}\`}>
                        {t.role === 'teacher' ? 'Giáo viên' : 'Trợ giảng'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm text-edu-fgSecondary">{t.school}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm font-semibold">{t.sessions}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-edu-bg rounded-full overflow-hidden">
                          <div className={\`h-full rounded-full \${t.attendance >= 95 ? 'bg-edu-success' : t.attendance >= 85 ? 'bg-edu-warn' : 'bg-edu-danger'}\`} style={{ width: \`\${t.attendance}%\` }}></div>
                        </div>
                        <span className="text-[0.75rem] font-bold text-edu-fg">{t.attendance}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <span className={\`font-bold text-[0.7rem] px-2 py-0.5 rounded-md \${t.late <= 3 ? 'bg-edu-successLight text-edu-success' : t.late <= 6 ? 'bg-edu-warnLight text-edu-warn' : 'bg-edu-dangerLight text-edu-danger'}\`}>
                        {t.late} lần
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <span className={\`font-semibold text-[0.75rem] px-2.5 py-1 rounded-full \${badge.cls}\`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-right">
                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-edu-border text-edu-fg hover:border-edu-accent hover:text-edu-accent transition-colors">Chi tiết</button>
                        <button className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-edu-border text-edu-fg hover:border-edu-accent hover:text-edu-accent transition-colors">Sửa</button>
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
