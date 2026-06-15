'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, MapPin, User, LogOut, BookOpen } from 'lucide-react';
import { cn } from '@/components/ui/stat-card';
import { useAppStore } from '@/store/useAppStore';
import { signOut } from 'next-auth/react';
import { useProfile } from '@/hooks/queries/useProfile';

const NAV = [
  { section: 'CÔNG VIỆC GIẢNG DẠY' },
  { id: 'dashboard', icon: Home, label: 'Hôm nay', path: '/dashboard' },
  { id: 'schedule', icon: CalendarDays, label: 'Lịch dạy', path: '/schedule' },
  { id: 'checkin', icon: MapPin, label: 'Check-in', path: '/checkin' },
  { section: 'TÀI KHOẢN' },
  { id: 'profile', icon: User, label: 'Cá nhân', path: '/profile' }
]

export function TeacherSidebar() {
  const pathname = usePathname();
  const sidebarOpen = useAppStore(state => state.sidebarOpen);
  const { data: profile } = useProfile();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const appName = profile?.customAppName || 'EduOps';
  const logoUrl = profile?.customLogoUrl;

  return (
    <aside className={cn(
      "w-[260px] bg-white border-r border-edu-border flex flex-col fixed top-0 left-0 bottom-0 z-[100] transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none",
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-5 flex items-center gap-3 border-b border-edu-border">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-9 h-9 object-contain rounded-md" />
        ) : (
          <div className="w-9 h-9 bg-gradient-to-br from-edu-accent to-[#7BC4FF] rounded-lg flex items-center justify-center text-white shadow-sm">
            <BookOpen size={20} />
          </div>
        )}
        <div>
          <h1 className="text-[1.05rem] font-bold text-edu-fg leading-tight truncate max-w-[170px]" title={appName}>{appName}</h1>
          <small className="text-[0.7rem] text-edu-muted block">Teacher Portal</small>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        {NAV.map((item, idx) => {
          if (item.section) {
            return (
              <div key={idx} className="mb-2">
                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-edu-muted px-3 py-3 pb-1.5">
                  {item.section}
                </div>
              </div>
            );
          }

          const isActive = pathname?.includes(`/me${item.path}`);
          const IconComponent = item.icon as React.ElementType;

          return (
            <Link 
              key={idx} 
              href={`/me${item.path === '/dashboard' ? '' : item.path}`}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-edu-fgSecondary text-sm font-medium mb-0.5 transition-colors group",
                "hover:bg-edu-accentLight hover:text-edu-accent",
                isActive && "bg-edu-accentLight text-edu-accent font-semibold"
              )}
            >
              <div className={cn("text-edu-muted group-hover:text-edu-accent transition-colors", isActive && "text-edu-accent")}>
                <IconComponent size={18} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div 
        onClick={handleLogout}
        className="p-4 border-t border-edu-border flex items-center gap-2.5 hover:bg-red-50 text-red-600 transition-colors cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
          <LogOut size={18} />
        </div>
        <div className="flex-1 overflow-hidden font-medium text-sm">
          Đăng xuất
        </div>
      </div>
    </aside>
  );
}
