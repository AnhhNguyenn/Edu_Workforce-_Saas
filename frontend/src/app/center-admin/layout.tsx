'use client';

import { ReactNode, useEffect } from 'react';
import { CenterSidebar } from '@/components/layout/center-sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/components/ui/stat-card';

export default function CenterAdminLayout({ children }: { children: ReactNode }) {
  const sidebarOpen = useAppStore(state => state.sidebarOpen);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      useAppStore.getState().setSidebarOpen(e.matches);
    };

    // Chạy lần đầu
    handleMediaChange(mql);

    // Lắng nghe sự thay đổi breakpoint
    mql.addEventListener('change', handleMediaChange);
    return () => mql.removeEventListener('change', handleMediaChange);
  }, []);

  return (
    <div className="flex min-h-screen relative">
      <CenterSidebar />
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-200"
          onClick={() => useAppStore.getState().toggleSidebar()}
        />
      )}
      {/* Cần update Topbar để nó hiển thị đúng màu/avatar của Center Admin, nhưng tạm dùng chung Topbar */}
      <Topbar />
      
      <main className={cn(
        "flex-1 p-4 md:p-7 transition-all duration-300 ease-in-out mt-16 min-h-[calc(100vh-64px)] w-full max-w-[100vw] overflow-x-hidden",
        sidebarOpen ? "lg:ml-[260px]" : "ml-0"
      )}>
        {children}
      </main>
    </div>
  );
}
