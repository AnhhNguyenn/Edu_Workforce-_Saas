'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, ClipboardCheck, BookOpen, Settings, GraduationCap, Building2, LineChart } from 'lucide-react';
import { cn } from '@/components/ui/stat-card';
import { useAppStore } from '@/store/useAppStore';

import { useProfile } from '@/hooks/queries/useProfile';

// Path chuẩn cho Center Admin
const NAV = [
  { section: 'VẬN HÀNH TRUNG TÂM' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển', path: '/dashboard' },
  { id: 'schools', icon: Building2, label: 'Cơ sở', path: '/schools' },
  { id: 'classes', icon: BookOpen, label: 'Lớp học', path: '/classes' },
  { id: 'students', icon: GraduationCap, label: 'Học sinh', path: '/students' },
  { id: 'schedules', icon: Calendar, label: 'Lịch giảng dạy', path: '/schedules' },
  { id: 'teachers', icon: Users, label: 'Giáo viên', path: '/teachers' },
  { section: 'BÁO CÁO & CÀI ĐẶT' },
  { id: 'attendance', icon: ClipboardCheck, label: 'Điểm danh', path: '/attendance' },
  { id: 'reports', icon: ClipboardCheck, label: 'Báo cáo buổi học', path: '/reports' },
  { id: 'analytics', icon: LineChart, label: 'Thống kê', path: '/analytics' },
  { id: 'settings', icon: Settings, label: 'Cài đặt trung tâm', path: '/settings' }
]

export function CenterSidebar() {
  const pathname = usePathname();
  const sidebarOpen = useAppStore(state => state.sidebarOpen);
  const { data: profile } = useProfile();

  const appName = profile?.customAppName || 'EduOps';
  const displayTitle = profile?.organizationName || 'Center Management';
  const logoUrl = profile?.customLogoUrl;

  return (
    <aside className={cn(
      "w-[260px] bg-white border-r border-edu-border flex flex-col fixed top-0 left-0 bottom-0 z-[100] transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none",
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-5 flex items-center gap-3 border-b border-edu-border">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-10 w-auto max-w-[200px] object-contain" />
        ) : (
          <div className="w-9 h-9 bg-gradient-to-br from-edu-accent to-[#7BC4FF] rounded-lg flex items-center justify-center text-white shadow-sm">
            <BookOpen size={20} />
          </div>
        )}
        <div>
          <h1 className="text-[1.05rem] font-bold text-edu-fg leading-tight truncate max-w-[170px]" title={displayTitle}>{displayTitle}</h1>
          <small className="text-[0.7rem] text-edu-muted block">Workforce Platform</small>
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

          const isActive = pathname?.includes(item.path as string);
          const IconComponent = item.icon as React.ElementType;

          return (
            <Link 
              key={idx} 
              href={`/ops${item.path === '/dashboard' ? '' : item.path}`}
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

    </aside>
  );
}
