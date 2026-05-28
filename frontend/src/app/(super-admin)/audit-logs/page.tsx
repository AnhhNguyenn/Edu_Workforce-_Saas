import { AUDIT_LOGS } from "@/lib/mock-data";

export default function AuditLogsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Audit Logs</h2>
        <p className="text-edu-muted text-sm">Theo dõi toàn bộ hoạt động quản trị</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border">
          <h3 className="font-semibold text-edu-fg">Lịch sử hoạt động</h3>
          <select className="px-3 py-1.5 rounded-lg border border-edu-border text-sm outline-none focus:border-edu-accent">
            <option>Tất cả loại</option>
            <option>Tạo mới</option>
            <option>Bảo mật</option>
            <option>Billing</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-edu-bg">
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Thời gian</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Người thực hiện</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Hành động</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Chi tiết</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Loại</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOGS.map((l, i) => {
                const badgeInfo = l.type === 'create' ? { cls: 'bg-edu-successLight text-edu-success', label: 'Tạo mới' } 
                                : l.type === 'security' ? { cls: 'bg-edu-dangerLight text-edu-danger', label: 'Bảo mật' } 
                                : { cls: 'bg-edu-accentLight text-edu-accent', label: 'Billing' };
                return (
                  <tr key={i} className="hover:bg-edu-accentLighter transition-colors">
                    <td className="py-3.5 px-5 border-b border-edu-border text-[0.8rem] text-edu-muted whitespace-nowrap">{l.time}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border font-semibold text-edu-fg text-sm">{l.user}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm text-edu-fg">{l.action}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm font-medium text-edu-accent">{l.detail}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <span className={\`font-bold text-[0.7rem] px-2 py-1 rounded-md uppercase tracking-wider \${badgeInfo.cls}\`}>
                        {badgeInfo.label}
                      </span>
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
