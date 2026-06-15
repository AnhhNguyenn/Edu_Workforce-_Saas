'use client';

import { Building2, Users, Calendar, Clock, CalendarOff } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { useClasses } from "@/hooks/queries/useClasses";
import { useUsers } from "@/hooks/queries/useUsers";
import { useReports } from "@/hooks/queries/useReports";
import { useSessions } from "@/hooks/queries/useSessions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from '@/components/ui/EmptyState';

export default function CenterAdminDashboard() {
  const { data: classes } = useClasses();
  const { data: teachers } = useUsers('TEACHER');
  const { data: reports } = useReports();
  const { data: sessions } = useSessions();

  // Filter today's sessions
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions?.items?.filter(s => s.sessionDate.startsWith(today)) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Tổng quan trung tâm</h2>
        <p className="text-edu-muted text-sm">Quản lý lớp học và giáo viên — Dữ liệu thời gian thực</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
        <StatCard icon={<Users size={20} />} label="Giáo viên trực thuộc" value={teachers?.totalCount || 0} type="accent" />
        <StatCard icon={<Building2 size={20} />} label="Lớp đang mở" value={classes?.totalCount || 0} type="success" />
        <StatCard icon={<Calendar size={20} />} label="Ca học hôm nay" value={todaySessions.length} type="warn" />
        <StatCard icon={<Clock size={20} />} label="Báo cáo điểm danh" value={reports?.totalCount || 0} type="accent" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-5">
          <span className="font-semibold text-base text-edu-fg">Ca dạy hôm nay</span>
        </div>
        
        {todaySessions.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <Table className="w-full whitespace-nowrap">
              <TableHeader>
              <TableRow>
                <TableHead>Mã Lớp</TableHead>
                <TableHead>Chủ đề</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todaySessions.map(s => (
                <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-semibold">{s.classId.substring(0, 8)}...</TableCell>
                  <TableCell>{s.lessonTitle || 'Chưa cập nhật'}</TableCell>
                  <TableCell>{s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}</TableCell>
                  <TableCell>
                    <Badge variant={s.statusCode === 'COMPLETED' ? 'success' : s.statusCode === 'ONGOING' ? 'warn' : 'info'}>
                      {s.statusCode === 'COMPLETED' ? 'Đã xong' : s.statusCode === 'ONGOING' ? 'Đang diễn ra' : 'Sắp học'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        ) : (
          <div className="py-4">
            <EmptyState icon={<CalendarOff size={32} />} title="Trống lịch học" description="Không có ca học nào được xếp lịch trong hôm nay." />
          </div>
        )}
      </div>
    </div>
  );
}
