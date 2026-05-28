import { Plus, ChevronLeft, ChevronRight, List } from "lucide-react";

export default function SchedulesPage() {
  const getCalEvents = (day: number) => {
    const evts: Record<number, string[]> = {
      3:['bg-edu-accentLight text-edu-accent|Lớp 8/2 07:30','bg-edu-successLight text-edu-success|Lớp 3A 09:00'],
      5:['bg-edu-accentLight text-edu-accent|Lớp 8/2 07:30','bg-edu-warnLight text-edu-warn|Lớp 10A1 13:30'],
      6:['bg-edu-successLight text-edu-success|Lớp Lá A 15:00','bg-[#F3E8FF] text-[#7C3AED]|Lớp 7/1 17:30'],
      10:['bg-edu-accentLight text-edu-accent|Lớp 8/2 07:30'],
      12:['bg-edu-accentLight text-edu-accent|Lớp 8/2 07:30','bg-edu-successLight text-edu-success|Lớp 3A 09:00','bg-edu-warnLight text-edu-warn|Lớp 10A1 13:30'],
      17:['bg-edu-accentLight text-edu-accent|Lớp 8/2 07:30','bg-[#F3E8FF] text-[#7C3AED]|Lớp 9/3 18:00'],
      19:['bg-edu-successLight text-edu-success|Lớp Lá A 15:00'],
      24:['bg-edu-accentLight text-edu-accent|Lớp 8/2 07:30','bg-edu-warnLight text-edu-warn|Lớp 10A1 13:30'],
      26:['bg-edu-successLight text-edu-success|Lớp 3A 09:00'],
      28:['bg-[#F3E8FF] text-[#7C3AED]|Lớp 7/1 17:30']
    };
    return evts[day] || [];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Schedules</h2>
          <p className="text-edu-muted text-sm">Lịch dạy — Core của hệ thống</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-edu-border text-edu-fg rounded-lg font-medium hover:border-edu-accent hover:text-edu-accent transition-colors shadow-sm">
            <List size={18} />
            List View
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-edu-accent text-white rounded-lg font-medium hover:bg-edu-accentHover transition-colors shadow-sm hover:shadow-md">
            <Plus size={18} />
            Tạo session
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border p-5">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-edu-muted hover:bg-edu-bg hover:text-edu-fg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-bold text-edu-fg">Tháng 6, 2025</h3>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-edu-muted hover:bg-edu-bg hover:text-edu-fg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          <button className="px-4 py-2 bg-white border border-edu-border text-edu-fg rounded-lg text-sm font-semibold hover:border-edu-accent hover:text-edu-accent transition-colors">
            Hôm nay
          </button>
        </div>

        <div className="grid grid-cols-7 gap-[1px] bg-edu-border rounded-xl overflow-hidden border border-edu-border">
          {/* Header */}
          {['T2','T3','T4','T5','T6','T7','CN'].map(d => (
            <div key={d} className="bg-edu-bg p-3 text-center text-[0.75rem] font-bold text-edu-muted uppercase tracking-wider">
              {d}
            </div>
          ))}

          {/* Days */}
          {Array.from({ length: 35 }).map((_, i) => {
            const dayNum = i - 2;
            const isOtherMonth = dayNum < 1 || dayNum > 30;
            const isToday = dayNum === 12;
            const displayNum = isOtherMonth ? (dayNum < 1 ? 31 + dayNum : dayNum - 30) : dayNum;
            const events = getCalEvents(dayNum);

            return (
              <div key={i} className={\`bg-white p-2 min-h-[120px] relative \${isOtherMonth ? 'opacity-40' : ''}\`}>
                <div className={\`text-[0.8rem] font-bold mb-1.5 w-7 h-7 flex items-center justify-center rounded-full \${isToday ? 'bg-edu-accent text-white' : 'text-edu-fg'}\`}>
                  {displayNum}
                </div>
                <div className="flex flex-col gap-1">
                  {events.map((e, idx) => {
                    const [cls, txt] = e.split('|');
                    return (
                      <div key={idx} className={\`px-2 py-1 rounded-md text-[0.65rem] font-semibold whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer hover:opacity-80 \${cls}\`}>
                        {txt}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
