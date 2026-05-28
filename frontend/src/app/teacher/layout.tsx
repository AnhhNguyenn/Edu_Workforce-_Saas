import { ReactNode } from "react";
import Link from "next/link";
import { Home, CalendarDays, MapPin, User, Bell } from "lucide-react";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  // We use a strictly mobile-constrained layout here for easy React Native conversion
  // Even on desktop, it will look like a mobile app simulator
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:w-[390px] h-[100dvh] sm:h-[844px] bg-white sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-[#1A2B42] overflow-hidden flex flex-col relative">
        
        {/* Status bar mock (hide on actual mobile, show on desktop) */}
        <div className="h-[44px] hidden sm:flex items-end justify-between px-7 pb-1.5 text-xs font-semibold text-edu-fg">
          <span>9:41</span>
          <div className="flex gap-1.5">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Mobile Header */}
        <header className="px-5 py-3 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-edu-fg">Hôm nay</h2>
          <button className="text-xl relative">
            <Bell size={24} className="text-edu-fgSecondary" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-edu-danger rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto px-5 pb-[90px]">
          {children}
        </main>

        {/* Bottom Tab Bar */}
        <nav className="absolute bottom-0 left-0 right-0 h-[80px] bg-white/95 backdrop-blur-md border-t border-edu-border flex items-center justify-around px-2 pb-safe">
          <TabItem href="/teacher/dashboard" icon={<Home size={24} />} label="Hôm nay" active />
          <TabItem href="/teacher/schedule" icon={<CalendarDays size={24} />} label="Lịch dạy" />
          <TabItem href="/teacher/checkin" icon={<MapPin size={24} />} label="Check-in" />
          <TabItem href="/teacher/profile" icon={<User size={24} />} label="Cá nhân" />
        </nav>
      </div>
    </div>
  );
}

function TabItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 p-2 w-16 \${active ? 'text-edu-accent' : 'text-edu-muted'}`}>
      {icon}
      <span className="text-[0.65rem] font-semibold">{label}</span>
    </Link>
  );
}

