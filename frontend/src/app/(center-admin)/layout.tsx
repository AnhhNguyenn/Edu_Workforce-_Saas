import { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, Users, School, BookOpen, Calendar, MapPin, FileText, Bell, Settings, Search } from "lucide-react";

export default function CenterAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-white border-r border-edu-border flex flex-col fixed inset-y-0 left-0 z-50 transition-transform max-lg:-translate-x-full lg:translate-x-0">
        <div className="p-5 flex items-center gap-3 border-b border-edu-border">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF8A65] to-[#FFB74D] flex items-center justify-center text-white text-lg font-bold">
            🏢
          </div>
          <div>
            <h1 className="text-base font-bold text-edu-fg leading-tight">CenterOps</h1>
            <small className="text-[0.7rem] text-edu-muted block -mt-0.5">EduCenter Sài Gòn</small>
          </div>
        </div>
        
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="mb-2">
            <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-edu-muted px-3 pt-3 pb-1.5">VẬN HÀNH</div>
            <Link href="/center-admin/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-edu-fgSecondary hover:bg-edu-accentLight hover:text-edu-accent transition-colors text-sm font-medium mb-0.5 bg-edu-accentLight text-edu-accent font-semibold">
              <BarChart3 size={18} />
              <span>Dashboard</span>
            </Link>
            <Link href="/center-admin/teachers" className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-edu-fgSecondary hover:bg-edu-accentLight hover:text-edu-accent transition-colors text-sm font-medium mb-0.5">
              <Users size={18} />
              <span>Teachers</span>
              <span className="ml-auto bg-edu-danger text-white text-[0.65rem] px-2 py-0.5 rounded-full font-bold">10</span>
            </Link>
            <Link href="/center-admin/schools" className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-edu-fgSecondary hover:bg-edu-accentLight hover:text-edu-accent transition-colors text-sm font-medium mb-0.5">
              <School size={18} />
              <span>Schools</span>
            </Link>
            <Link href="/center-admin/classes" className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-edu-fgSecondary hover:bg-edu-accentLight hover:text-edu-accent transition-colors text-sm font-medium mb-0.5">
              <BookOpen size={18} />
              <span>Classes</span>
            </Link>
            <Link href="/center-admin/schedules" className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-edu-fgSecondary hover:bg-edu-accentLight hover:text-edu-accent transition-colors text-sm font-medium mb-0.5">
              <Calendar size={18} />
              <span>Schedules</span>
            </Link>
          </div>
          <div className="mb-2">
            <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-edu-muted px-3 pt-3 pb-1.5">GIÁM SÁT</div>
            <Link href="/center-admin/attendance" className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-edu-fgSecondary hover:bg-edu-accentLight hover:text-edu-accent transition-colors text-sm font-medium mb-0.5">
              <MapPin size={18} />
              <span>Attendance</span>
              <span className="ml-auto bg-edu-danger text-white text-[0.65rem] px-2 py-0.5 rounded-full font-bold">2</span>
            </Link>
            <Link href="/center-admin/reports" className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-edu-fgSecondary hover:bg-edu-accentLight hover:text-edu-accent transition-colors text-sm font-medium mb-0.5">
              <FileText size={18} />
              <span>Reports</span>
              <span className="ml-auto bg-edu-danger text-white text-[0.65rem] px-2 py-0.5 rounded-full font-bold">3</span>
            </Link>
            <Link href="/center-admin/notifications" className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-edu-fgSecondary hover:bg-edu-accentLight hover:text-edu-accent transition-colors text-sm font-medium mb-0.5">
              <Bell size={18} />
              <span>Notifications</span>
            </Link>
            <Link href="/center-admin/settings" className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-edu-fgSecondary hover:bg-edu-accentLight hover:text-edu-accent transition-colors text-sm font-medium mb-0.5">
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-edu-border flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF8A65] to-[#FFB74D] flex items-center justify-center text-white font-bold text-sm">
            AD
          </div>
          <div className="flex-1">
            <div className="text-[0.85rem] font-semibold leading-tight">Admin Trung tâm</div>
            <div className="text-[0.7rem] text-edu-muted leading-tight">EduCenter Sài Gòn</div>
          </div>
        </div>
      </aside>

      {/* TOPBAR */}
      <header className="h-[64px] bg-white/85 backdrop-blur-md border-b border-edu-border flex items-center px-8 fixed top-0 right-0 left-0 lg:left-[260px] z-40">
        <div className="flex-1 max-w-[400px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
          <input 
            type="text" 
            placeholder="Tìm kiếm giáo viên, lớp, báo cáo..." 
            className="w-full py-2.5 pr-3.5 pl-9 rounded-md bg-edu-bg border border-transparent focus:bg-white focus:border-edu-accent focus:ring-2 focus:ring-edu-accent/15 outline-none transition-all text-sm"
          />
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-edu-muted hover:bg-edu-accentLight hover:text-edu-accent transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-edu-danger rounded-full border-2 border-white"></span>
          </button>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF8A65] to-[#FFB74D] flex items-center justify-center text-white font-bold text-sm cursor-pointer ml-2">
            AD
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="ml-0 lg:ml-[260px] mt-[64px] flex-1 p-4 sm:p-8 min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}
