"use client";

import { ReactNode, useEffect } from 'react';
import { TeacherSidebar } from '@/components/layout/teacher-sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/components/ui/stat-card';

export default function TeacherLayout({ children }: { children: ReactNode }) {
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
    <div className="flex min-h-screen relative bg-gray-50/30">
      <TeacherSidebar />
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-200"
          onClick={() => useAppStore.getState().toggleSidebar()}
        />
      )}
      <Topbar />
      
      <main className={cn(
        "flex-1 p-4 md:p-7 transition-all duration-300 ease-in-out mt-16 min-h-[calc(100vh-64px)] w-full max-w-[100vw] overflow-x-hidden",
        sidebarOpen ? "lg:ml-[260px]" : "ml-0"
      )}>
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
