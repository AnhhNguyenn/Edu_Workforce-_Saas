'use client';

import { useState } from 'react';
import { Building2, Users, Calendar, Clock, CalendarOff } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { useClasses } from "@/hooks/queries/useClasses";
import { useUsers } from "@/hooks/queries/useUsers";
import { useReports } from "@/hooks/queries/useReports";
import { useSessions } from "@/hooks/queries/useSessions";
import { useSchools } from "@/hooks/queries/useSchools";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { EmptyState } from '@/components/ui/EmptyState';

export default function CenterAdminDashboard() {
  const { data: classes } = useClasses();
  const { data: schools } = useSchools();
  const { data: teachers } = useUsers('TEACHER');
  const { data: assistants } = useUsers('ASSISTANT');
  const { data: reports } = useReports();
  const { data: sessions } = useSessions();

  const [activeTab, setActiveTab] = useState<'ALL' | 'SANG' | 'CHIEU' | 'TOI'>('ALL');

  // Filter today's sessions
  const todayLocalStr = new Date().toLocaleDateString('en-CA');
  const todaySessions = sessions?.items?.filter(s => {
    const sDateLocalStr = new Date(s.sessionDate).toLocaleDateString('en-CA');
    return sDateLocalStr === todayLocalStr;
  }) || [];
  
  // Group today's sessions by GroupId
  const groupedTodaySessions: any[] = [];
  const groupsMap = new Map<string, any>();

  todaySessions.forEach((s: any) => {
    if (s.groupId) {
      if (!groupsMap.has(s.groupId)) {
        groupsMap.set(s.groupId, {
          ...s,
          classIds: [s.classId],
          isGrouped: true,
          studentsCount: classes?.items?.find((c: any) => c.id === s.classId)?.studentsCount || 0
        });
      } else {
        const group = groupsMap.get(s.groupId);
        if (!group.classIds.includes(s.classId)) {
          group.classIds.push(s.classId);
          group.studentsCount += classes?.items?.find((c: any) => c.id === s.classId)?.studentsCount || 0;
        }
      }
    } else {
      groupedTodaySessions.push({
        ...s,
        classIds: [s.classId],
        isGrouped: false,
        studentsCount: classes?.items?.find((c: any) => c.id === s.classId)?.studentsCount || 0
      });
    }
  });

  groupsMap.forEach(group => groupedTodaySessions.push(group));

  const getRealTimeStatus = (s: any) => {
    if (s.statusCode === 'CANCELED') return 'CANCELED';
    if (s.statusCode === 'COMPLETED') return 'COMPLETED';
    
    // Only apply time-based logic if it's today
    const sDate = new Date(s.sessionDate).toLocaleDateString('en-CA');
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (sDate !== todayStr) return s.statusCode;

    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    
    const startParts = (s.startTime || '00:00').split(':');
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    
    const endParts = (s.endTime || '23:59').split(':');
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

    if (currentTotalMinutes < startMinutes) return 'SCHEDULED';
    if (currentTotalMinutes > endMinutes) return 'COMPLETED';
    return 'ONGOING';
  };

  const computedGroupedSessions = groupedTodaySessions.map(s => ({...s, computedStatus: getRealTimeStatus(s)}));

  const filteredSessions = computedGroupedSessions.filter(s => {
    if (activeTab === 'ALL') return true;
    const hour = parseInt(s.startTime.split(':')[0]);
    if (activeTab === 'SANG') return hour >= 5 && hour < 12;
    if (activeTab === 'CHIEU') return hour >= 12 && hour < 17;
    if (activeTab === 'TOI') return hour >= 17;
    return true;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="w-full h-full space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Tổng quan trung tâm</h2>
        <p className="text-edu-muted text-sm">Quản lý lớp học và giáo viên — Dữ liệu thời gian thực</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-7">
        <StatCard icon={<Users size={20} />} label="Giáo viên trực thuộc" value={teachers?.totalCount || 0} type="accent" />
        <StatCard icon={<Users size={20} />} label="Trợ giảng trực thuộc" value={assistants?.totalCount || 0} type="accent" />
        <StatCard icon={<Building2 size={20} />} label="Lớp đang mở" value={classes?.totalCount || 0} type="success" />
        <StatCard icon={<Calendar size={20} />} label="Ca học hôm nay" value={groupedTodaySessions.length} type="warn" />
        <StatCard icon={<Clock size={20} />} label="Báo cáo điểm danh" value={reports?.totalCount || 0} type="accent" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5">
          <span className="font-semibold text-base text-edu-fg">Ca dạy hôm nay</span>
          
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto hide-scrollbar">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'SANG', label: 'Ca sáng' },
              { id: 'CHIEU', label: 'Ca chiều' },
              { id: 'TOI', label: 'Ca tối' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 text-[13px] font-bold rounded-md transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === tab.id ? 'bg-white shadow-sm text-[#2563EB]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {filteredSessions.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <Table className="w-full whitespace-nowrap">
              <TableHeader>
              <TableRow>
                <TableHead>Lớp</TableHead>
                <TableHead>Trung tâm</TableHead>
                <TableHead>Chủ đề</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Giáo viên</TableHead>
                <TableHead>Trợ giảng</TableHead>
                <TableHead>Sĩ số</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map(s => {
                let className = '';
                if (s.isGrouped) {
                  className = s.classIds.map((cid: string) => classes?.items?.find((c: any) => c.id === cid)?.name || cid.substring(0, 8)).join(' + ');
                } else {
                  const classInfo = classes?.items?.find((c: any) => c.id === s.classId);
                  className = classInfo?.name || s.classId?.substring(0, 8);
                }

                const classInfo = classes?.items?.find((c: any) => c.id === s.classId);
                const schoolName = schools?.items?.find((sch: any) => sch.id === classInfo?.schoolId)?.name || 'Chưa cập nhật';
                const teacherName = teachers?.items?.find((t: any) => t.id === s.teacherId)?.fullName || 'Chưa phân công';
                const validAssistants = s.assistantIds?.filter((id: string) => id && id.trim() !== '') || [];
                const assistantNames = validAssistants.length > 0 
                  ? validAssistants.map((id: string) => assistants?.items?.find((a: any) => a.id === id)?.fullName).filter(Boolean).join(', ') || 'Chưa phân công'
                  : 'Chưa phân công';
                
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const [startH, startM] = s.startTime.split(':').map(Number);
                const startTotal = startH * 60 + startM;
                const [endH, endM] = s.endTime.split(':').map(Number);
                const endTotal = endH * 60 + endM;

                let displayStatus = 'Sắp học';
                let badgeVariant: BadgeVariant = 'info';

                if (s.statusCode === 'COMPLETED') {
                  displayStatus = 'Đã xong';
                  badgeVariant = 'success';
                } else if (s.statusCode === 'CANCELED') {
                  displayStatus = 'Đã hủy';
                  badgeVariant = 'muted';
                } else if (s.statusCode === 'ONGOING') {
                  displayStatus = 'Đang diễn ra';
                  badgeVariant = 'warn';
                } else {
                  if (currentMinutes > endTotal) {
                    displayStatus = 'Chưa báo cáo';
                    badgeVariant = 'muted';
                  } else if (currentMinutes >= startTotal && currentMinutes <= endTotal) {
                    displayStatus = 'Đang diễn ra';
                    badgeVariant = 'warn';
                  }
                }

                return (
                  <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-semibold text-blue-600">{className}</TableCell>
                    <TableCell className="text-slate-600">{schoolName}</TableCell>
                    <TableCell>{s.lessonTitle || 'Chưa cập nhật'}</TableCell>
                    <TableCell>{s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}</TableCell>
                    <TableCell className="text-slate-600">{teacherName}</TableCell>
                    <TableCell className="text-slate-600">{assistantNames}</TableCell>
                    <TableCell className="font-semibold">{s.studentsCount || 0}</TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant}>
                        {displayStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
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
