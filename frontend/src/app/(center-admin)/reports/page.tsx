import { REPORTS, statusBadgeInfo } from "@/lib/mock-data";
import { Download, FileText } from "lucide-react";

export default function ReportsPage() {
  const TEMPLATES = [
    {name:'THCS Template',fields:'12 trường',type:'Trung học'},
    {name:'Mầm non Template',fields:'10 trường',type:'Mầm non'},
    {name:'STEM Template',fields:'14 trường',type:'STEM'}
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Reports</h2>
          <p className="text-edu-muted text-sm">Báo cáo giảng dạy</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-edu-border text-edu-fg rounded-lg font-medium hover:border-edu-accent hover:text-edu-accent transition-colors shadow-sm">
          <Download size={18} />
          Export Excel
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border">
          <h3 className="font-semibold text-edu-fg">Báo cáo gần đây</h3>
          <select className="px-3 py-1.5 rounded-lg border border-edu-border text-sm outline-none focus:border-edu-accent bg-edu-bg">
            <option>Tất cả trạng thái</option>
            <option>Đã nộp</option>
            <option>Chưa nộp</option>
            <option>Nháp</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-edu-bg">
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Trường</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Lớp</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Giáo viên</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Ngày</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Sĩ số</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Trạng thái</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {REPORTS.map((r, i) => {
                const badge = statusBadgeInfo(r.status);
                return (
                  <tr key={i} className="hover:bg-edu-accentLighter transition-colors">
                    <td className="py-3.5 px-5 border-b border-edu-border font-medium text-edu-fg">{r.school}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm">{r.cls}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm">{r.teacher}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm text-edu-muted">{r.date}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm font-semibold">{r.attendance}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <span className={\`font-semibold text-[0.75rem] px-2.5 py-1 rounded-full \${badge.cls}\`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-right">
                      <button className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-edu-border text-edu-fg hover:border-edu-accent hover:text-edu-accent transition-colors">
                        {r.status === 'submitted' ? 'Xem' : 'Nhập'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border p-6">
        <h3 className="font-semibold text-edu-fg flex items-center gap-2 mb-5">
          <FileText size={18} className="text-edu-accent" />
          Form mẫu báo cáo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TEMPLATES.map((t, i) => (
            <div key={i} className="p-4 border border-edu-border rounded-xl cursor-pointer hover:border-edu-accent hover:shadow-md transition-all group">
              <h4 className="font-bold text-sm text-edu-fg mb-1 group-hover:text-edu-accent transition-colors">{t.name}</h4>
              <p className="text-xs text-edu-muted">{t.fields} · {t.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
