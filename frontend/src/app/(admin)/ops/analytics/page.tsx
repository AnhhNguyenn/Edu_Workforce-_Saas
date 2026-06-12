'use client';

import React from 'react';
import { CalendarDays, CheckCircle2, Clock, FileText } from "lucide-react";
import { useClasses } from "@/hooks/queries/useClasses";
import { useReports } from "@/hooks/queries/useReports";
import { useSessions } from "@/hooks/queries/useSessions";
import { useUsers } from "@/hooks/queries/useUsers";

export default function AnalyticsPage() {
  const { data: classes } = useClasses();
  const { data: reports } = useReports();
  const { data: sessions } = useSessions();
  const { data: teachers } = useUsers('TEACHER');

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Thống kê trung tâm</h2>
        <p className="text-edu-muted text-sm">Phân tích hiệu suất trung tâm (Sử dụng dữ liệu thực tế)</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard icon={<CalendarDays size={20} />} label="Ca học (Tổng)" value={sessions?.totalCount?.toString() || "0"} type="accent" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Lớp đang mở" value={classes?.totalCount?.toString() || "0"} type="success" />
        <StatCard icon={<Clock size={20} />} label="Giáo viên" value={teachers?.totalCount?.toString() || "0"} type="warn" />
        <StatCard icon={<FileText size={20} />} label="Báo cáo đã gửi" value={reports?.totalCount?.toString() || "0"} type="danger" />
      </div>

      <div className="grid grid-cols-1 gap-5 mb-7">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-edu-border hover:shadow-md transition-shadow">
          <div className="font-semibold text-base text-edu-fg mb-4">Chi tiết các lớp học gần đây</div>
          <div className="flex flex-col">
            {classes?.items && classes.items.length > 0 ? (
              classes.items.slice(0, 5).map((c, i) => (
                <div key={c.id} className={`flex justify-between items-center py-3 ${i < 4 ? 'border-b border-edu-border' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-edu-accent">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-edu-fg">{c.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-edu-muted">Sĩ số: <strong className="text-edu-fg">{c.maxStudents}</strong></span>
                    <span className={`font-bold px-2 py-0.5 rounded-md ${c.status === 'ACTIVE' ? 'bg-edu-successLight text-edu-success' : 'bg-gray-100 text-gray-600'}`}>
                      {c.status === 'ACTIVE' ? 'Đang mở' : 'Chưa mở'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5 text-edu-muted">Chưa có dữ liệu lớp học</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, type }: { icon: React.ReactNode, label: string, value: string, type: 'accent' | 'success' | 'warn' | 'danger' }) {
  const colors = {
    accent: { bg: 'bg-edu-accentLight', text: 'text-edu-accent', circle: 'after:bg-edu-accent' },
    success: { bg: 'bg-edu-successLight', text: 'text-edu-success', circle: 'after:bg-edu-success' },
    warn: { bg: 'bg-edu-warnLight', text: 'text-edu-warn', circle: 'after:bg-edu-warn' },
    danger: { bg: 'bg-edu-dangerLight', text: 'text-edu-danger', circle: 'after:bg-edu-danger' },
  };
  const c = colors[type];

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-edu-border hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden after:content-[''] after:absolute after:-top-5 after:-right-5 after:w-20 after:h-20 after:rounded-full after:opacity-10 ${c.circle}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold leading-tight text-edu-fg">{value}</div>
      <div className="text-xs text-edu-muted mt-1">{label}</div>
    </div>
  );
}

