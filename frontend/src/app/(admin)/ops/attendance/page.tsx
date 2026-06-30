'use client';

import { CheckCircle2, Clock, HelpCircle, MapPin, Download, CalendarOff, Building2, BookOpen, UserCheck } from "lucide-react";
import { useSessions } from "@/hooks/queries/useSessions";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AttendanceModal } from "./_components/AttendanceModal";
import { useProfile } from '@/hooks/queries/useProfile';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loader2 } from 'lucide-react';
import { useTodayAttendances } from "@/hooks/queries/useAttendances";
import { useClasses } from "@/hooks/queries/useClasses";
import { useUsers } from "@/hooks/queries/useUsers";
import { useSchools } from "@/hooks/queries/useSchools";

export default function AttendancePage() {
  const today = new Date().toISOString().split('T')[0];
  const { data: sessions, isLoading: isLoadingSessions } = useSessions(today, today);
  const { data: attendances, isLoading: isLoadingAttendances } = useTodayAttendances();
  const { data: classes } = useClasses();
  const { data: schools } = useSchools();
  const { data: teachers } = useUsers('TEACHER');
  const { data: assistants } = useUsers('ASSISTANT');
  
  const isLoading = isLoadingSessions || isLoadingAttendances;
  const todaySessionsRaw = sessions?.items || [];
  
  // Group today's sessions by GroupId
  const groupedTodaySessions: any[] = [];
  const groupsMap = new Map<string, any>();

  todaySessionsRaw.forEach((s: any) => {
    if (s.groupId) {
      if (!groupsMap.has(s.groupId)) {
        groupsMap.set(s.groupId, {
          ...s,
          classIds: [s.classId]
        });
      } else {
        const group = groupsMap.get(s.groupId);
        if (!group.classIds.includes(s.classId)) {
          group.classIds.push(s.classId);
        }
      }
    } else {
      groupedTodaySessions.push({
        ...s,
        classIds: [s.classId]
      });
    }
  });

  groupsMap.forEach(group => groupedTodaySessions.push(group));
  
  const todaySessions = groupedTodaySessions.sort((a, b) => {
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  const { data: profile } = useProfile();
  const isAuthorized = profile?.role === 'SUPER_ADMIN' || profile?.role === 'CENTER_ADMIN' || profile?.role === 'TEACHER';

  const [selectedSession, setSelectedSession] = useState<any>(null);

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
    if (currentTotalMinutes > endMinutes) return 'MISSING';
    return 'ONGOING';
  };

  const computedSessions = todaySessions.map(s => ({...s, computedStatus: getRealTimeStatus(s)}));

  return (
    <div className="w-full h-full space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Điểm danh</h2>
        <p className="text-edu-muted text-sm">Giám sát điểm danh tức thời hôm nay</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
        <StatCard icon={<CheckCircle2 size={20} />} label="Ca học hôm nay" value={computedSessions.length.toString()} type="success" />
        <StatCard icon={<Clock size={20} />} label="Đã hoàn thành" value={computedSessions.filter(s => s.computedStatus === 'COMPLETED').length.toString()} type="accent" />
        <StatCard icon={<HelpCircle size={20} />} label="Chưa bắt đầu" value={computedSessions.filter(s => s.computedStatus === 'SCHEDULED').length.toString()} type="warn" />
        <StatCard icon={<MapPin size={20} />} label="Đang diễn ra" value={computedSessions.filter(s => s.computedStatus === 'ONGOING').length.toString()} type="danger" />
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
                <TableRow className="bg-slate-50 border-b-slate-200">
                  <TableHead className="text-[13px] font-semibold text-slate-500 h-11">Mã Lớp</TableHead>
                  <TableHead className="text-[13px] font-semibold text-slate-500 h-11">Cơ sở</TableHead>
                  <TableHead className="text-[13px] font-semibold text-slate-500 h-11">Chủ đề</TableHead>
                  <TableHead className="text-[13px] font-semibold text-slate-500 h-11">Giờ học</TableHead>
                  <TableHead className="text-[13px] font-semibold text-slate-500 h-11">Check-in / Check-out</TableHead>
                  <TableHead className="text-[13px] font-semibold text-slate-500 h-11">Trạng thái</TableHead>
                  <TableHead className="text-[13px] font-semibold text-slate-500 h-11 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {computedSessions.map((s) => {
                  const classNames = s.classIds?.map((cid: string) => {
                    const classObj = classes?.items?.find((c: any) => c.id === cid);
                    return classObj?.name || `${cid.substring(0, 8)}...`;
                  }).join(' + ') || '';
                  
                  const firstClass = classes?.items?.find((c: any) => s.classIds?.includes(c.id));
                  const schoolName = schools?.items?.find((sch: any) => sch.id === firstClass?.schoolId)?.name || '---';

                  const teacherAttendance = attendances?.find((a: any) => a.sessionId === s.id && a.userId === s.teacherId);
                  const formatTime = (timeStr?: string) => timeStr ? new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---';
                  const checkinStr = teacherAttendance ? `${formatTime(teacherAttendance.checkinTime)} / ${formatTime(teacherAttendance.checkoutTime)}` : 'Chưa ghi nhận';
                  
                  return (
                  <TableRow key={s.id} className="hover:bg-slate-50/70 transition-all duration-200 border-b-slate-100">
                    <TableCell>
                      <div className="inline-flex items-center justify-center px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[13px] rounded-md shadow-sm">
                        {classNames}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-600 text-[13px] font-medium">
                        <Building2 size={14} className="text-indigo-400" />
                        <span className="capitalize">{schoolName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {s.lessonTitle ? (
                        <div className="flex items-center gap-1.5 text-slate-700 text-[13px] max-w-[180px]">
                          <BookOpen size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate font-medium">{s.lessonTitle}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[13px]">---</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md shadow-sm font-bold text-[13px]">
                        <Clock size={13} className="text-blue-500" />
                        {s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {teacherAttendance ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <UserCheck size={14} className="text-emerald-500 shrink-0" />
                            <span className="font-semibold text-slate-700 text-[13px]">{checkinStr}</span>
                          </div>
                          {teacherAttendance.lateMinutes > 0 && <span className="text-[11px] text-red-500 font-medium ml-5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"></span> Đi trễ {teacherAttendance.lateMinutes} phút</span>}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 italic text-[13px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Chưa ghi nhận
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.computedStatus === 'COMPLETED' ? 'success' : s.computedStatus === 'ONGOING' ? 'warn' : s.computedStatus === 'MISSING' ? 'secondary' : 'info'} className="shadow-sm">
                        {s.computedStatus === 'COMPLETED' ? 'Đã xong' : s.computedStatus === 'ONGOING' ? 'Đang diễn ra' : s.computedStatus === 'MISSING' ? 'Chưa báo cáo' : 'Sắp tới'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isAuthorized && (
                        <Button 
                          variant="outline"
                          size="sm"
                          className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 font-semibold transition-all h-8 px-3 shadow-sm"
                          onClick={() => setSelectedSession(s)}
                        >
                          Chi tiết
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  );
                })}
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

