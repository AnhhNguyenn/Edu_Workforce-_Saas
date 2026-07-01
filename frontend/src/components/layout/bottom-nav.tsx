'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Bell, User } from 'lucide-react';
import { cn } from '@/components/ui/stat-card';

const tabs = [
  { name: 'Trang chủ', href: '/me/dashboard', icon: Home },
  { name: 'Lịch dạy', href: '/me/schedule', icon: Calendar },
  { name: 'Thông báo', href: '/me/notifications', icon: Bell },
  { name: 'Cá nhân', href: '/me/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-[100] pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          
          return (
            <Link 
              key={tab.href} 
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon size={20} className={cn("transition-transform duration-200", isActive && "scale-110")} />
              <span className="text-[10px] font-semibold">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
