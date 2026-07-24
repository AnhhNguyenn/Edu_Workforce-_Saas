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
import { DatePicker } from "@/components/ui/date-picker";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const activeDate = selectedDate || new Date();
  const dateStr = activeDate.toLocaleDateString('en-CA');
  const selectedDateStrForDisplay = activeDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const { data: sessions, isLoading: isLoadingSessions } = useSessions(dateStr, dateStr);
  const { data: attendances, isLoading: isLoadingAttendances } = useTodayAttendances(dateStr);
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

    const assignedTeacherIds = (s.teacherIds && s.teacherIds.length > 0) ? s.teacherIds : (s.teacherId ? [s.teacherId] : []);
    const assignedAssistantIds = (s.assistantIds && s.assistantIds.length > 0) ? s.assistantIds : (s.assistantId ? [s.assistantId] : []);
    const assignedStaffIds = [...assignedTeacherIds, ...assignedAssistantIds];

    if (assignedStaffIds.length === 0) return s.statusCode;

    // Lấy tất cả lượt điểm danh của ca học này
    const sessionAttendances = attendances?.filter((a: any) => a.sessionId === s.id) || [];

    // Chỉ áp dụng tính toán nếu đang diễn ra hoặc đã kết thúc
    const sDate = new Date(s.sessionDate).toLocaleDateString('en-CA');
    const todayStr = new Date().toLocaleDateString('en-CA');
    
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    
    const startParts = (s.startTime || '00:00').split(':');
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    
    const endParts = (s.endTime || '23:59').split(':');
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

    const isPastStart = sDate < todayStr || (sDate === todayStr && currentTotalMinutes >= startMinutes);
    const isPastEnd = sDate < todayStr || (sDate === todayStr && currentTotalMinutes > endMinutes);

    if (!isPastStart) return 'SCHEDULED';

    // Kiểm tra chi tiết từng nhân sự
    const teacherIssues: string[] = [];
    const assistantIssues: string[] = [];

    let hasTeacherAttended = false;
    let hasAssistantAttended = false;

    // Kiểm tra Giáo viên
    assignedTeacherIds.forEach((uid: string) => {
      const att = sessionAttendances.find((a: any) => a.userId === uid);
      if (!att) {
        if (isPastStart) teacherIssues.push('Chưa Check-in');
      } else {
        hasTeacherAttended = true;
        if (isPastEnd && !att.checkoutTime) {
          teacherIssues.push('Chưa Check-out');
        }
      }
    });

    // Kiểm tra Trợ giảng
    assignedAssistantIds.forEach((uid: string) => {
      const att = sessionAttendances.find((a: any) => a.userId === uid);
      if (!att) {
        if (isPastStart) assistantIssues.push('Chưa Check-in');
      } else {
        hasAssistantAttended = true;
        if (isPastEnd && !att.checkoutTime) {
          assistantIssues.push('Chưa Check-out');
        }
      }
    });

    const totalIssuesCount = teacherIssues.length + assistantIssues.length;

    // Nếu không có lỗi nào
    if (totalIssuesCount === 0) {
      if (isPastEnd) return 'COMPLETED';
      return 'ONGOING';
    }

    // Nếu đã kết thúc giờ học mà không một ai check-in
    if (isPastEnd && !hasTeacherAttended && !hasAssistantAttended) {
      return 'ABSENT';
    }

    // Tạo nhãn chi tiết lỗi
    const labels: string[] = [];
    if (teacherIssues.length > 0) {
      labels.push(`GV ${teacherIssues.join('/')}`);
    }
    if (assistantIssues.length > 0) {
      labels.push(`TG ${assistantIssues.join('/')}`);
    }

    const issueText = labels.join(' | ');
    if (isPastEnd) {
      return `ISSUE:${issueText}`;
    }
    return 'ONGOING';
  };

  const getStatusDisplay = (status: string) => {
    if (status.startsWith('ISSUE:')) {
      const label = status.replace('ISSUE:', '');
      return { label, variant: 'danger' as const };
    }

    switch(status) {
      case 'COMPLETED': return { label: 'Hoàn thành', variant: 'success' as const };
      case 'ONGOING': return { label: 'Đang diễn ra', variant: 'warn' as const };
      case 'ABSENT': return { label: 'Vắng mặt', variant: 'danger' as const };
      case 'SCHEDULED': return { label: 'Sắp tới', variant: 'info' as const };
      case 'CANCELED': return { label: 'Đã hủy', variant: 'muted' as const };
      default: return { label: status, variant: 'muted' as const };
    }
  };

  const computedSessions = todaySessions.map(s => ({...s, computedStatus: getRealTimeStatus(s)}));

  return (
    <div className="w-full h-full space-y-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-7">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Điểm danh</h2>
          <p className="text-edu-muted text-sm">Giám sát điểm danh ngày {selectedDateStrForDisplay}</p>
        </div>
        <div className="w-full sm:w-48">
          <DatePicker selected={activeDate} onChange={(date) => setSelectedDate(date)} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
        <StatCard icon={<CheckCircle2 size={20} />} label="Tổng ca học" value={computedSessions.length.toString()} type="success" />
        <StatCard icon={<Clock size={20} />} label="Đã hoàn thành" value={computedSessions.filter(s => s.computedStatus === 'COMPLETED').length.toString()} type="accent" />
        <StatCard icon={<HelpCircle size={20} />} label="Đang & Sắp diễn ra" value={computedSessions.filter(s => s.computedStatus === 'ONGOING' || s.computedStatus === 'SCHEDULED').length.toString()} type="info" />
        <StatCard icon={<MapPin size={20} />} label="Cần xử lý (Vắng/Thiếu ca)" value={computedSessions.filter(s => s.computedStatus === 'ABSENT' || s.computedStatus.startsWith('ISSUE:')).length.toString()} type="danger" />
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
              description={`Không có ca học nào được xếp lịch trong ngày ${selectedDateStrForDisplay}.`}
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

                  const assignedTeacherIds = (s.teacherIds && s.teacherIds.length > 0) ? s.teacherIds : (s.teacherId ? [s.teacherId] : []);
                  const assignedAssistantIds = (s.assistantIds && s.assistantIds.length > 0) ? s.assistantIds : (s.assistantId ? [s.assistantId] : []);
                  
                  const assignedStaff = [
                    ...assignedTeacherIds.map((id: string) => ({ id, role: 'TEACHER' })),
                    ...assignedAssistantIds.map((id: string) => ({ id, role: 'ASSISTANT' }))
                  ];
                  
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
                      <div className="flex flex-col gap-2.5">
                        {assignedStaff.map((staff, idx) => {
                          const staffObj = staff.role === 'TEACHER'
                            ? teachers?.items?.find((t: any) => t.id === staff.id)
                            : assistants?.items?.find((a: any) => a.id === staff.id);
                          const staffName = staffObj?.fullName || (staff.role === 'TEACHER' ? 'Giáo viên' : 'Trợ giảng');
                          const staffRoleLabel = staff.role === 'TEACHER' ? 'GV' : 'TG';
                          const staffRoleColor = staff.role === 'TEACHER' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-teal-50 text-teal-700 border-teal-100';

                          const staffAttendance = attendances?.find((a: any) => a.sessionId === s.id && a.userId === staff.id);
                          const formatTime = (timeStr?: string) => timeStr ? new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---';
                          const checkinStr = staffAttendance ? `${formatTime(staffAttendance.checkinTime)} / ${formatTime(staffAttendance.checkoutTime)}` : 'Chưa check-in';

                          return (
                            <div key={staff.id + '-' + idx} className="flex items-start gap-2.5 text-[13px]">
                              <span className={`inline-flex items-center justify-center px-1.5 py-0.5 border text-[10px] font-bold rounded shrink-0 ${staffRoleColor}`}>
                                {staffRoleLabel}
                              </span>

                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-700">{staffName}</span>
                                {staffAttendance ? (
                                  <div className="flex items-start gap-2 mt-1">
                                    {staffAttendance.checkinImageUrl && (
                                      <a href={staffAttendance.checkinImageUrl} target="_blank" rel="noreferrer" className="shrink-0 group relative block">
                                        <img src={staffAttendance.checkinImageUrl} alt="Selfie" className="w-8 h-8 object-cover rounded border border-slate-200 shadow-sm group-hover:opacity-80 transition-opacity" loading="lazy" />
                                      </a>
                                    )}
                                    <div className="flex flex-col gap-0.5">
                                      <div className="flex items-center gap-1">
                                        <UserCheck size={12} className="text-emerald-500 shrink-0" />
                                        <span className="font-medium text-slate-600 text-[12px]">{checkinStr}</span>
                                      </div>
                                      {(staffAttendance.lateMinutes > 0 || staffAttendance.earlyCheckoutMinutes > 0) && (
                                        <div className="flex flex-wrap gap-1.5 items-center text-[10px] font-medium">
                                          {staffAttendance.lateMinutes > 0 && (
                                            <span className="text-red-500 flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-red-500"></span> Trễ {staffAttendance.lateMinutes}p</span>
                                          )}
                                          {staffAttendance.earlyCheckoutMinutes > 0 && (
                                            <span className="text-orange-500 flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-orange-500"></span> Về sớm {staffAttendance.earlyCheckoutMinutes}p</span>
                                          )}
                                        </div>
                                      )}
                                      {staffAttendance.note && (
                                        <div className="text-[10px] text-slate-400 italic max-w-[180px] truncate" title={staffAttendance.note}>
                                          <span className="font-medium text-slate-500">Ghi chú:</span> {staffAttendance.note}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-red-500 text-[12px] font-medium flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                    Chưa check-in
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {assignedStaff.length === 0 && (
                          <span className="text-slate-400 italic text-[13px]">Không có nhân sự</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const display = getStatusDisplay(s.computedStatus);
                        return (
                          <Badge variant={display.variant} className="shadow-sm">
                            {display.label}
                          </Badge>
                        );
                      })()}
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

function StatCard({ icon, label, value, type }: { icon: React.ReactNode, label: string, value: string, type: 'accent' | 'success' | 'warn' | 'danger' | 'info' }) {
  const colors: Record<string, { bg: string, text: string, circle: string }> = {
    accent: { bg: 'bg-edu-accentLight', text: 'text-edu-accent', circle: 'after:bg-edu-accent' },
    success: { bg: 'bg-edu-successLight', text: 'text-edu-success', circle: 'after:bg-edu-success' },
    warn: { bg: 'bg-edu-warnLight', text: 'text-edu-warn', circle: 'after:bg-edu-warn' },
    danger: { bg: 'bg-edu-dangerLight', text: 'text-edu-danger', circle: 'after:bg-edu-danger' },
    info: { bg: 'bg-blue-50', text: 'text-blue-500', circle: 'after:bg-blue-500' },
  };
  const c = colors[type] || colors.accent;

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

