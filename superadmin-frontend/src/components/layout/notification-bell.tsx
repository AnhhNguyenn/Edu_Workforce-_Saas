'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink, Calendar, Info, AlertTriangle, AlertOctagon, CheckCircle2, X } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { cn } from '@/components/ui/stat-card';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, NotificationDto } from '@/hooks/queries/useNotifications';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationDto | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const { data: notificationsData } = useNotifications(1, 20);
  const notifications = notificationsData?.items || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleNotificationClick = (notification: NotificationDto) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    setIsOpen(false); // Close dropdown popover
    setSelectedNotification(notification); // Open detail modal
  };

  const markAllAsRead = () => {
    markAllReadMutation.mutate();
  };

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

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'danger':
        return <AlertOctagon size={18} className="text-rose-600" />;
      case 'warn':
        return <AlertTriangle size={18} className="text-amber-600" />;
      case 'success':
        return <CheckCircle2 size={18} className="text-emerald-600" />;
      default:
        return <Info size={18} className="text-blue-600" />;
    }
  };

  const getBadgeVariant = (type?: string): BadgeVariant => {
    switch (type) {
      case 'danger': return 'danger';
      case 'warn': return 'warn';
      case 'success': return 'success';
      default: return 'info';
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-9 h-9 flex items-center justify-center rounded-lg transition-colors relative",
            isOpen ? "bg-edu-accentLight text-edu-accent" : "text-edu-muted hover:bg-edu-accentLight hover:text-edu-accent"
          )}
          title="Thông báo"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-edu-danger border-2 border-white rounded-full animate-pulse"></span>
          )}
        </button>

        {/* DROPDOWN POPOVER */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-edu-border overflow-hidden z-[200] animate-in fade-in-0 zoom-in-95">
            <div className="p-4 border-b border-edu-border flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-edu-fg text-sm flex items-center gap-2">
                <Bell size={16} className="text-edu-accent" />
                Thông báo
                {unreadCount > 0 && (
                  <span className="bg-edu-danger text-white text-[0.65rem] px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} mới
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  disabled={markAllReadMutation.isPending}
                  className="text-[0.75rem] text-edu-accent font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <Check size={13} /> {markAllReadMutation.isPending ? 'Đang đọc...' : 'Đánh dấu tất cả đã đọc'}
                </button>
              )}
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-edu-border">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-edu-muted text-sm flex flex-col items-center gap-2">
                  <Bell size={28} className="text-slate-300" />
                  <span>Không có thông báo nào</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "p-4 hover:bg-slate-50 cursor-pointer transition-colors relative group flex items-start gap-3",
                      !n.isRead ? "bg-blue-50/40" : "opacity-80"
                    )}
                  >
                    {!n.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-edu-accent"></div>
                    )}
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm border",
                      n.type === 'danger' ? 'bg-rose-50 border-rose-100' : 
                      n.type === 'warn' ? 'bg-amber-50 border-amber-100' : 
                      n.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 
                      'bg-blue-50 border-blue-100'
                    )}>
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className={cn("text-xs font-bold truncate", !n.isRead ? "text-edu-fg" : "text-slate-600")}>
                          {n.title}
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-1">{n.message}</div>
                      <div className="text-[10px] text-edu-muted font-medium flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: vi })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* NOTIFICATION DETAIL MODAL */}
      <Modal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        title={
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
              selectedNotification?.type === 'danger' ? 'bg-rose-50 border-rose-100' : 
              selectedNotification?.type === 'warn' ? 'bg-amber-50 border-amber-100' : 
              selectedNotification?.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 
              'bg-blue-50 border-blue-100'
            )}>
              {getNotificationIcon(selectedNotification?.type)}
            </div>
            <div>
              <h3 className="text-base font-bold text-edu-fg">Chi tiết Thông báo</h3>
              <p className="text-xs text-edu-muted">
                {selectedNotification?.createdAt 
                  ? format(new Date(selectedNotification.createdAt), 'dd/MM/yyyy - HH:mm', { locale: vi })
                  : ''}
              </p>
            </div>
          </div>
        }
        className="max-w-lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="secondary" onClick={() => setSelectedNotification(null)}>
              Đóng lại
            </Button>
            {selectedNotification?.actionLink && (
              <Button 
                variant="primary" 
                onClick={() => {
                  const link = selectedNotification.actionLink;
                  setSelectedNotification(null);
                  if (link) router.push(link);
                }}
                className="gap-2 font-semibold shadow-sm"
              >
                <span>Xem chi tiết ngay</span>
                <ExternalLink size={14} />
              </Button>
            )}
          </div>
        }
      >
        {selectedNotification && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between gap-2">
              <Badge variant={getBadgeVariant(selectedNotification.type)}>
                {selectedNotification.type === 'danger' ? 'Khẩn cấp' :
                 selectedNotification.type === 'warn' ? 'Cảnh báo' :
                 selectedNotification.type === 'success' ? 'Tính năng' : 'Thông tin'}
              </Badge>
              <span className="text-xs text-edu-muted font-medium">
                {formatDistanceToNow(new Date(selectedNotification.createdAt), { addSuffix: true, locale: vi })}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {selectedNotification.title}
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {selectedNotification.message}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
