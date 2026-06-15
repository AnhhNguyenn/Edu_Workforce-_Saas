'use client';

import { CheckCircle2, Clock, HelpCircle, MapPin, Download, CalendarOff } from "lucide-react";
import { useSessions } from "@/hooks/queries/useSessions";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AttendanceModal } from "./_components/AttendanceModal";
import { useProfile } from '@/hooks/queries/useProfile';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loader2 } from 'lucide-react';

export default function AttendancePage() {
  const { data: sessions, isLoading } = useSessions();
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions?.items?.filter(s => s.sessionDate.startsWith(today)) || [];

  const { data: profile } = useProfile();
  const isAuthorized = profile?.role === 'SUPER_ADMIN' || profile?.role === 'CENTER_ADMIN' || profile?.role === 'TEACHER';

  const [selectedSession, setSelectedSession] = useState<any>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Điểm danh</h2>
        <p className="text-edu-muted text-sm">Giám sát điểm danh tức thời hôm nay</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
        <StatCard icon={<CheckCircle2 size={20} />} label="Ca học hôm nay" value={todaySessions.length.toString()} type="success" />
        <StatCard icon={<Clock size={20} />} label="Đã hoàn thành" value={todaySessions.filter(s => s.statusCode === 'COMPLETED').length.toString()} type="accent" />
        <StatCard icon={<HelpCircle size={20} />} label="Chưa bắt đầu" value={todaySessions.filter(s => s.statusCode === 'SCHEDULED').length.toString()} type="warn" />
        <StatCard icon={<MapPin size={20} />} label="Đang diễn ra" value={todaySessions.filter(s => s.statusCode === 'ONGOING').length.toString()} type="danger" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-edu-border">
          <h3 className="font-semibold text-edu-fg">Chi tiết điểm danh giảng dạy</h3>
          {isAuthorized && (
            <div className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto flex justify-center items-center gap-2 text-edu-fg font-semibold hover:border-edu-accent hover:text-edu-accent transition-colors">
                <Download size={16} />
                Xuất file Excel
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="text-center py-10 text-edu-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu điểm danh...</div>
          ) : todaySessions.length === 0 ? (
            <EmptyState 
              icon={<CalendarOff size={32} />}
              title="Trống lịch học"
              description="Không có ca học nào được xếp lịch trong hôm nay."
            />
          ) : (
            <Table className="w-full whitespace-nowrap">
              <TableHeader>
                <TableRow className="bg-edu-bg">
                  <TableHead className="uppercase tracking-wider">Mã Lớp</TableHead>
                  <TableHead className="uppercase tracking-wider">Chủ đề</TableHead>
                  <TableHead className="uppercase tracking-wider">Giờ học</TableHead>
                  <TableHead className="uppercase tracking-wider">Check-in / Check-out</TableHead>
                  <TableHead className="uppercase tracking-wider">Trạng thái ca học</TableHead>
                  <TableHead className="uppercase tracking-wider">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todaySessions.map((s) => (
                  <TableRow key={s.id} className="hover:bg-slate-50/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300">
                    <TableCell className="font-semibold text-edu-fg">{s.classId?.substring(0, 8)}...</TableCell>
                    <TableCell className="truncate max-w-[200px]" title={s.lessonTitle}>{s.lessonTitle || '---'}</TableCell>
                    <TableCell className="font-bold text-edu-accent">{s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)}</TableCell>
                    <TableCell className="text-edu-muted">Chưa ghi nhận</TableCell>
                    <TableCell>
                      <Badge variant={s.statusCode === 'COMPLETED' ? 'success' : s.statusCode === 'ONGOING' ? 'info' : 'muted'}>
                        {s.statusCode === 'COMPLETED' ? 'Đã xong' : s.statusCode === 'ONGOING' ? 'Đang diễn ra' : 'Sắp tới'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isAuthorized && (
                        <Button 
                          variant="outline"
                          size="sm"
                          className="bg-[#E8F5E9] text-[#2E7D32] border-transparent hover:bg-[#C8E6C9] font-medium transition-colors"
                          onClick={() => setSelectedSession(s)}
                        >
                          Điểm danh
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {selectedSession && (
        <AttendanceModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
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
    <div className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-edu-border hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden after:content-[''] after:absolute after:-top-5 after:-right-5 after:w-20 after:h-20 after:rounded-full after:opacity-10 ${c.circle}`}>
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <div className="text-2xl sm:text-3xl font-bold leading-tight text-edu-fg">{value}</div>
      <div className="text-[11px] sm:text-xs text-edu-muted mt-1 truncate">{label}</div>
    </div>
  );
}

