import { SCHOOLS, COLORS } from "@/lib/mock-data";
import { Plus, School as SchoolIcon } from "lucide-react";

export default function SchoolsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Schools</h2>
          <p className="text-edu-muted text-sm">Quản lý trường học & điểm dạy</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-edu-accent text-white rounded-lg font-medium hover:bg-edu-accentHover transition-colors shadow-sm hover:shadow-md">
          <Plus size={18} />
          Thêm trường
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SCHOOLS.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-edu-border hover:border-edu-accent hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group relative">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: COLORS[i % 8] }}
              >
                <SchoolIcon size={20} />
              </div>
              <h4 className="font-semibold text-edu-fg text-base">{s.name}</h4>
            </div>
            
            <div className="text-sm text-edu-muted mb-3 flex items-start gap-1.5">
              <span className="mt-0.5">📍</span>
              <span className="leading-snug">{s.addr}</span>
            </div>
            
            <div className="flex gap-4 text-[0.8rem] text-edu-fgSecondary font-medium">
              <div className="flex items-center gap-1.5">
                <span>📚</span> {s.classes} lớp
              </div>
              <div className="flex items-center gap-1.5">
                <span>🎯</span> {s.radius}m GPS
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-edu-bg">
              <button className="w-full py-2 bg-edu-bg text-edu-fgSecondary text-sm font-semibold rounded-lg group-hover:bg-edu-accentLight group-hover:text-edu-accent transition-colors">
                Quản lý điểm dạy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
