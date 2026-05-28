'use client';

import { Bell } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from "@/components/ui/stat-card";

export default function TeacherNotificationsPage() {
  const notifications = useAppStore(state => state.notifications);

  return (
    <div className="max-w-4xl mx-auto space-y-7 p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Thông báo</h2>
        <p className="text-edu-muted text-sm">Cập nhật lịch học, báo cáo và nhắc nhở</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-10 text-center">
             <div className="w-16 h-16 bg-gray-100 text-edu-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-edu-fg">Không có thông báo nào</h3>
            <p className="text-sm text-edu-muted">Bạn đã xem hết tất cả các thông báo.</p>
          </div>
        ) : (
          <div className="divide-y divide-edu-border">
            {notifications.map((n) => (
              <div key={n.id} className={cn("p-5 flex gap-4 hover:bg-gray-50 transition-colors", !n.read && "bg-edu-accentLighter/30")}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  n.type === 'danger' ? 'bg-edu-dangerLight text-edu-danger' : 
                  n.type === 'warn' ? 'bg-edu-warnLight text-edu-warn' : 
                  n.type === 'success' ? 'bg-edu-successLight text-edu-success' : 
                  'bg-edu-accentLight text-edu-accent'
                )}>
                  <Bell size={18} />
                </div>
                <div>
                  <h4 className={cn("text-base mb-1", !n.read ? "font-bold text-edu-fg" : "font-semibold text-edu-fgSecondary")}>
                    {n.title}
                  </h4>
                  <p className="text-sm text-edu-muted mb-2">{n.message}</p>
                  <span className="text-xs font-medium text-edu-muted">
                    {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: vi })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
