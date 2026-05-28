import { NOTIFICATIONS } from "@/lib/mock-data";
import { Check, Trash2 } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-7">
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Notifications</h2>
          <p className="text-edu-muted text-sm">Thông báo hệ thống</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-edu-border text-edu-fg rounded-lg text-sm font-medium hover:border-edu-accent hover:text-edu-accent transition-colors">
            <Check size={16} />
            Đánh dấu đã đọc
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-edu-border text-edu-danger rounded-lg text-sm font-medium hover:border-edu-danger hover:bg-edu-dangerLight transition-colors">
            <Trash2 size={16} />
            Xóa tất cả
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        {NOTIFICATIONS.map((n, i) => (
          <div 
            key={i} 
            className={\`flex gap-4 p-5 border-b border-edu-border last:border-0 hover:bg-edu-accentLighter transition-colors cursor-pointer \${n.unread ? 'bg-edu-accentLighter' : ''}\`}
          >
            <div className={\`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 \${n.bg}\`}>
              {n.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className={\`text-sm \${n.unread ? 'font-bold text-edu-fg' : 'font-semibold text-edu-fgSecondary'}\`}>
                  {n.title}
                </h4>
                <span className="text-xs text-edu-muted whitespace-nowrap ml-4">{n.time}</span>
              </div>
              <p className="text-sm text-edu-muted">{n.desc}</p>
            </div>
            {n.unread && (
              <div className="w-2.5 h-2.5 rounded-full bg-edu-accent self-center"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
