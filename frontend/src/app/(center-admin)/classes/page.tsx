import { Plus } from "lucide-react";

export default function ClassesPage() {
  const CLASSES = [
    {cls:'Lớp 8/2',school:'THCS Hoàng Diệu',prog:'English A2',teacher:'Nguyễn Thị Minh Anh',asst:'Lê Thu Trang',count:'40',sched:'T2-T6 07:30'},
    {cls:'Lớp 3A',school:'Tiểu học Lê Văn Tám',prog:'English Starters',teacher:'Trần Văn Hùng',asst:'—',count:'32',sched:'T3-T5 09:00'},
    {cls:'Lớp 10A1',school:'THPT Trần Phú',prog:'English B1',teacher:'Ngô Thanh Tùng',asst:'Lê Thu Trang',count:'38',sched:'T2-T4 13:30'},
    {cls:'Lớp Lá A',school:'Mầm non Hoa Sen',prog:'STEM Kỹ năng',teacher:'Phạm Đức Minh',asst:'Bùi Thị Kim Liên',count:'25',sched:'T3-T6 15:00'},
    {cls:'Lớp 7/1',school:'THCS Nguyễn Huệ',prog:'English A1+',teacher:'Hoàng Thị Thu Hà',asst:'—',count:'38',sched:'T2-T6 17:30'},
    {cls:'Lớp 9/3',school:'THCS Hoàng Diệu',prog:'STEM Robotics',teacher:'Vũ Thị Bích Ngọc',asst:'Đỗ Quang Vinh',count:'35',sched:'T5-T7 18:00'}
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Classes</h2>
          <p className="text-edu-muted text-sm">Quản lý lớp học và phân công</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-edu-accent text-white rounded-lg font-medium hover:bg-edu-accentHover transition-colors shadow-sm hover:shadow-md">
          <Plus size={18} />
          Tạo lớp
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-edu-bg">
                <th className="py-4 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Lớp</th>
                <th className="py-4 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Trường</th>
                <th className="py-4 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Chương trình</th>
                <th className="py-4 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Giáo viên</th>
                <th className="py-4 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Trợ giảng</th>
                <th className="py-4 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border text-center">Sĩ số</th>
                <th className="py-4 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Lịch học</th>
              </tr>
            </thead>
            <tbody>
              {CLASSES.map((c, i) => (
                <tr key={i} className="hover:bg-edu-accentLighter transition-colors">
                  <td className="py-4 px-5 border-b border-edu-border font-semibold text-edu-fg whitespace-nowrap">{c.cls}</td>
                  <td className="py-4 px-5 border-b border-edu-border text-sm text-edu-fgSecondary">{c.school}</td>
                  <td className="py-4 px-5 border-b border-edu-border text-sm font-medium">{c.prog}</td>
                  <td className="py-4 px-5 border-b border-edu-border text-sm">{c.teacher}</td>
                  <td className="py-4 px-5 border-b border-edu-border text-sm text-edu-muted">{c.asst}</td>
                  <td className="py-4 px-5 border-b border-edu-border text-sm font-semibold text-center">{c.count}</td>
                  <td className="py-4 px-5 border-b border-edu-border text-[0.8rem] text-edu-accent font-medium">{c.sched}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
