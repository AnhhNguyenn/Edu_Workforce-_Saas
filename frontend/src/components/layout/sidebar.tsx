'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Building2, Users, CreditCard, LineChart, Activity, Settings, Shield, BookOpen, LogOut } from 'lucide-react';
import { cn } from '@/components/ui/stat-card';
import { useAppStore } from '@/store/useAppStore';

const SUPER_ADMIN_NAV = [
  { section: 'QUẢN TRỊ' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/super-admin/dashboard' },
  { id: 'organizations', icon: Building2, label: 'Organizations', path: '/super-admin/organizations' },
  { id: 'admins', icon: Users, label: 'Admins', path: '/super-admin/admins' },
  { section: 'BÁO CÁO & TÀI CHÍNH' },
  { id: 'subscriptions', icon: CreditCard, label: 'Gói dịch vụ (SaaS)', path: '/super-admin/subscriptions' },
  { id: 'analytics', icon: LineChart, label: 'Thống kê tổng quan', path: '/super-admin/analytics' },
  { section: 'HỆ THỐNG' },
  { id: 'roles', icon: Shield, label: 'Phân quyền & Vai trò', path: '/super-admin/roles' },
  { id: 'audit-logs', icon: Activity, label: 'Audit Logs', path: '/super-admin/audit-logs' },
  { id: 'settings', icon: Settings, label: 'Cài đặt hệ thống', path: '/super-admin/settings' }
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useAppStore(state => state.sidebarOpen);

  return (
    <aside className={cn(
      "w-[260px] bg-white border-r border-edu-border flex flex-col fixed top-0 left-0 bottom-0 z-[100] transition-transform duration-200",
      !sidebarOpen && "-translate-x-full"
    )}>
      <div className="p-5 flex items-center gap-3 border-b border-edu-border">
        <div className="w-9 h-9 bg-gradient-to-br from-edu-accent to-[#7BC4FF] rounded-lg flex items-center justify-center text-white shadow-sm">
          <BookOpen size={20} />
        </div>
        <div>
          <h1 className="text-[1.05rem] font-bold text-edu-fg leading-tight">EduOps</h1>
          <small className="text-[0.7rem] text-edu-muted block">Workforce Platform</small>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        {SUPER_ADMIN_NAV.map((item, idx) => {
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
              href={item.path as string}
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
              {item.badge && (
                <span className="ml-auto bg-edu-danger text-white text-[0.65rem] px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-edu-border flex items-center justify-between hover:bg-edu-accentLighter transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-edu-accent to-[#7BC4FF] flex items-center justify-center text-white font-bold text-xs shadow-sm">
            SA
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-[0.85rem] font-bold text-edu-fg truncate">Super Admin</div>
            <div className="text-[0.7rem] text-edu-muted truncate">Platform Owner</div>
          </div>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-2 text-edu-muted hover:text-edu-danger hover:bg-red-50 rounded-md transition-colors"
          title="Đăng xuất"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
