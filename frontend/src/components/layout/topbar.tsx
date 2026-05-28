'use client';

import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/ui/stat-card';
import { Search, Menu } from 'lucide-react';
import { NotificationBell } from './notification-bell';
import { useSignalR } from '@/lib/useSignalR';

export function Topbar() {
  const sidebarOpen = useAppStore(state => state.sidebarOpen);
  const toggleSidebar = useAppStore(state => state.toggleSidebar);
  
  // Initialize SignalR Connection
  useSignalR();

  return (
    <header className={cn(
      "h-16 bg-white/85 backdrop-blur-md border-b border-edu-border flex items-center px-8 fixed top-0 right-0 z-[90] transition-all duration-200",
      sidebarOpen ? "left-[260px]" : "left-0"
    )}>
      {/* Menu Toggle for mobile/tablet */}
      <button 
        onClick={toggleSidebar}
        className="mr-4 p-2 -ml-2 text-edu-muted hover:text-edu-accent hover:bg-edu-accentLight rounded-lg transition-colors"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 max-w-[400px] relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted">
          <Search size={16} />
        </div>
        <Input 
          className="pl-9 bg-edu-bg border-transparent focus:bg-white" 
          placeholder="Tìm kiếm trung tâm, giáo viên, lớp..."
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FFB347] to-[#FFCC80] flex items-center justify-center text-white font-bold text-xs cursor-pointer shadow-sm hover:shadow-md transition-all ml-1">
          SA
        </div>
      </div>
    </header>
  );
}
