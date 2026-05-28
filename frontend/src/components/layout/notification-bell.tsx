'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/components/ui/stat-card';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const notifications = useAppStore(state => state.notifications);
  const unreadCount = useAppStore(state => state.unreadCount);
  const markAsRead = useAppStore(state => state.markAsRead);
  const markAllAsRead = useAppStore(state => state.markAllAsRead);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-9 h-9 flex items-center justify-center rounded-lg transition-colors relative",
          isOpen ? "bg-edu-accentLight text-edu-accent" : "text-edu-muted hover:bg-edu-accentLight hover:text-edu-accent"
        )}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-edu-danger border-2 border-white rounded-full"></span>
        )}
      </button>

      {/* DROPDOWN UI */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-edu-border overflow-hidden z-[200]">
          <div className="p-4 border-b border-edu-border flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-edu-fg text-sm flex items-center gap-2">
              Thông báo
              {unreadCount > 0 && (
                <span className="bg-edu-danger text-white text-[0.65rem] px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[0.7rem] text-edu-accent font-medium hover:underline flex items-center gap-1"
              >
                <Check size={12} /> Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-edu-muted text-sm">
                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                Không có thông báo mới
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={cn(
                      "p-4 border-b border-edu-border hover:bg-gray-50 cursor-pointer transition-colors relative group",
                      !n.read ? "bg-edu-accentLighter/30" : "opacity-80"
                    )}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-edu-accent"></div>
                    )}
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        n.type === 'danger' ? 'bg-edu-dangerLight text-edu-danger' : 
                        n.type === 'warn' ? 'bg-edu-warnLight text-edu-warn' : 
                        n.type === 'success' ? 'bg-edu-successLight text-edu-success' : 
                        'bg-edu-accentLight text-edu-accent'
                      )}>
                        <Bell size={14} />
                      </div>
                      <div className="flex-1">
                        <div className={cn("text-sm font-semibold mb-0.5", !n.read ? "text-edu-fg" : "text-edu-fgSecondary")}>
                          {n.title}
                        </div>
                        <div className="text-xs text-edu-muted mb-1.5">{n.message}</div>
                        <div className="text-[0.65rem] text-edu-muted font-medium">
                          {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: vi })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
