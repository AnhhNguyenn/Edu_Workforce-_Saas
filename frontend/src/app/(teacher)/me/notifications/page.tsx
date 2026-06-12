'use client';

import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/queries/useNotifications";
import { CheckCheck, BellRing, Info, AlertTriangle, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function TeacherNotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={18} className="text-edu-danger" />;
      case 'message': return <MessageSquare size={18} className="text-edu-accent" />;
      case 'reminder': return <BellRing size={18} className="text-edu-warn" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-7 p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Thông báo</h2>
          <p className="text-edu-muted text-sm">Cập nhật lịch học, báo cáo và nhắc nhở</p>
        </div>
        <Button 
          variant="secondary" 
          className="gap-2" 
          onClick={handleMarkAllRead}
          disabled={markAllReadMutation.isPending || notifications?.items?.length === 0}
        >
          <CheckCheck size={18} />
          {markAllReadMutation.isPending ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        {isLoading ? (
          <div className="text-center py-10 text-edu-muted">Đang tải thông báo...</div>
        ) : notifications?.items?.length === 0 ? (
          <div className="py-6">
            <EmptyState description="Bạn đã xem hết tất cả các thông báo." />
          </div>
        ) : (
          <div className="divide-y divide-edu-border">
            {notifications?.items?.map((n) => (
              <div 
                key={n.id} 
                className={`p-5 flex gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-white shadow-sm ring-4 ring-blue-50' : 'bg-gray-50 border border-gray-100'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-base ${!n.isRead ? 'font-bold text-edu-fg' : 'font-semibold text-gray-700'}`}>
                      {n.title}
                    </h4>
                    <span className="text-xs text-edu-muted whitespace-nowrap ml-4">
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className={`text-sm ${!n.isRead ? 'text-gray-700' : 'text-edu-muted'}`}>
                    {n.message}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-edu-accent mt-2 shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
