'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/components/ui/stat-card';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const sidebarOpen = useAppStore(state => state.sidebarOpen);

  return (
    <div className="flex min-h-screen relative">
      <Sidebar />
      <Topbar />
      
      <main className={cn(
        "flex-1 p-7 transition-all duration-200 mt-16 min-h-[calc(100vh-64px)]",
        sidebarOpen ? "ml-[260px]" : "ml-0"
      )}>
        {children}
      </main>
    </div>
  );
}
