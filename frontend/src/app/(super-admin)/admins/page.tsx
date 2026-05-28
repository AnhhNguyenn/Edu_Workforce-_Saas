import { statusBadgeInfo } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export default function AdminsPage() {
  const ADMINS = [
    {name:'Lê Thị Mai',org:'MathKids Cần Thơ',email:'mai@mathkids.vn',last:'Hôm nay 08:30',status:'active'},
    {name:'Nguyễn Văn Nam',org:'EduCenter Sài Gòn',email:'nam@educenter.vn',last:'Hôm nay 09:15',status:'active'},
    {name:'Trần Thị Hương',org:'English Garden',email:'huong@enggarden.vn',last:'Hôm qua 17:40',status:'active'},
    {name:'Phạm Minh Tuấn',org:'STEM Academy',email:'tuan@stem-dn.vn',last:'3 ngày trước',status:'inactive'}
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Admins</h2>
        <p className="text-edu-muted text-sm">Quản lý tài khoản admin trung tâm</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border">
          <h3 className="font-semibold text-edu-fg">Danh sách Admin</h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-edu-accent text-white rounded-md text-sm font-medium hover:bg-edu-accentHover transition-colors">
            <Plus size={16} />
            Tạo Admin
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-edu-bg">
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Admin</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Trung tâm</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Email</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Lần đăng nhập cuối</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Trạng thái</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {ADMINS.map((a, i) => {
                const badge = statusBadgeInfo(a.status);
                return (
                  <tr key={i} className="hover:bg-edu-accentLighter transition-colors">
                    <td className="py-3.5 px-5 border-b border-edu-border font-semibold text-edu-fg">{a.name}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm text-edu-fgSecondary">{a.org}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm font-medium text-edu-accent">{a.email}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm text-edu-fgSecondary">{a.last}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <span className={\`font-semibold text-[0.75rem] px-2.5 py-1 rounded-full \${badge.cls}\`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-right">
                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-edu-border text-edu-fg hover:border-edu-accent hover:text-edu-accent transition-colors">Sửa</button>
                        <button className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-edu-border text-edu-fg hover:border-edu-accent hover:text-edu-accent transition-colors">Reset PW</button>
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
