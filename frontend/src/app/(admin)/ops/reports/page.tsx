'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSchools } from '@/hooks/queries/useSchools';
import { useClasses } from '@/hooks/queries/useClasses';
import { useUsers } from '@/hooks/queries/useUsers';
import { useSessions } from '@/hooks/queries/useSessions';
import { useReports } from '@/hooks/queries/useReports';
import { Search, ChevronLeft, ChevronDown, ChevronRight, Building2, GraduationCap, User, Calendar, ClipboardCheck, AlertCircle, Users, Loader2, BookOpen, UserCheck, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { ReportModal } from './_components/ReportModal';
import { DatePicker } from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';

function getWeeksOfMonth(year: number, month: number) {
  const weeks: { weekIndex: number; startDate: Date; endDate: Date; label: string }[] = [];
  
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  
  let currentStart = new Date(firstDay);
  let weekIndex = 1;
  
  while (currentStart <= lastDay) {
    const currentEnd = new Date(currentStart);
    const dayOfWeek = currentEnd.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    currentEnd.setDate(currentEnd.getDate() + daysUntilSunday);
    
    if (currentEnd > lastDay) {
      currentEnd.setTime(lastDay.getTime());
    }
    
    const startStr = currentStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const endStr = currentEnd.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    
    weeks.push({
      weekIndex,
      startDate: new Date(currentStart),
      endDate: new Date(currentEnd),
      label: `Tuần ${weekIndex} (${startStr} - ${endStr})`
    });
    
    const nextStart = new Date(currentEnd);
    nextStart.setDate(nextStart.getDate() + 1);
    currentStart = nextStart;
    weekIndex++;
  }
  
  return weeks;
}

interface WeekPickerProps {
  selectedYear: number;
  selectedMonth: number;
  selectedWeekIndex: number;
  onChange: (year: number, month: number, weekIndex: number) => void;
}

function WeekPicker({
  selectedYear,
  selectedMonth,
  selectedWeekIndex,
  onChange,
}: WeekPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tempYear, setTempYear] = useState(selectedYear);
  const [tempMonth, setTempMonth] = useState(selectedMonth);

  useEffect(() => {
    if (isOpen) {
      setTempYear(selectedYear);
      setTempMonth(selectedMonth);
    }
  }, [isOpen, selectedYear, selectedMonth]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const weeksOfTemp = useMemo(() => {
    return getWeeksOfMonth(tempYear, tempMonth);
  }, [tempYear, tempMonth]);

  const currentWeeks = useMemo(() => {
    return getWeeksOfMonth(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const selectedWeek = currentWeeks.find(w => w.weekIndex === selectedWeekIndex) || currentWeeks[0];
  
  const displayLabel = selectedWeek 
    ? `Tuần ${selectedWeekIndex} (${selectedWeek.startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${selectedWeek.endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})`
    : 'Chọn tuần...';

  return (
    <div ref={containerRef} className="relative w-full sm:w-64">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-md border border-edu-border bg-white px-3.5 py-2 text-sm transition-all duration-200 outline-none hover:border-gray-300 focus:border-edu-accent focus:ring-4 focus:ring-edu-accentLight/50 text-edu-fg ${
          isOpen ? 'border-edu-accent ring-4 ring-edu-accentLight/50' : ''
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Calendar size={16} className="text-edu-muted flex-shrink-0" />
          <span className="truncate font-semibold text-slate-700">{displayLabel}</span>
        </div>
        <ChevronDown size={16} className="text-edu-muted opacity-70 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-80 overflow-hidden rounded-xl border border-edu-border bg-white p-4 shadow-xl animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
            <button
              type="button"
              onClick={() => setTempYear(prev => prev - 1)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-slate-800">Năm {tempYear}</span>
            <button
              type="button"
              onClick={() => setTempYear(prev => prev + 1)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {Array.from({ length: 12 }, (_, i) => {
              const m = i + 1;
              const isSelected = tempMonth === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTempMonth(m)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-edu-accent text-white'
                      : 'text-slate-600 hover:bg-edu-accentLighter hover:text-edu-accent'
                  }`}
                >
                  T{m}
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Chọn Tuần</div>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {weeksOfTemp.map((w) => {
                const isSelected = selectedYear === tempYear && selectedMonth === tempMonth && selectedWeekIndex === w.weekIndex;
                return (
                  <button
                    key={w.weekIndex}
                    type="button"
                    onClick={() => {
                      onChange(tempYear, tempMonth, w.weekIndex);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-edu-accentLighter text-edu-accent font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Tuần {w.weekIndex} ({w.startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {w.endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CenterAdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'discipline'>('day');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(new Date());
  
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(1);

  // States for accordion expansion
  const [expandedSchools, setExpandedSchools] = useState<Record<string, boolean>>({});
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  const activeDayDate = selectedDayDate || new Date();
  const selectedDateStrForDisplay = activeDayDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const currentWeeks = useMemo(() => {
    return getWeeksOfMonth(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Set current week on load
  useEffect(() => {
    const today = new Date();
    if (selectedYear === today.getFullYear() && selectedMonth === (today.getMonth() + 1)) {
      const currentWeek = currentWeeks.find(w => today >= w.startDate && today <= w.endDate);
      if (currentWeek) {
        setSelectedWeekIndex(currentWeek.weekIndex);
      }
    }
  }, [selectedYear, selectedMonth, currentWeeks]);

  const activeWeek = useMemo(() => {
    return currentWeeks.find(w => w.weekIndex === selectedWeekIndex) || currentWeeks[0];
  }, [currentWeeks, selectedWeekIndex]);

  const activeWeekStart = activeWeek?.startDate || new Date();
  const activeWeekEnd = activeWeek?.endDate || new Date();

  const getWeekRangeDisplay = () => {
    const startDisplay = activeWeekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const endDisplay = activeWeekEnd.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${startDisplay} - ${endDisplay}`;
  };

  const { queryStartDate, queryEndDate } = useMemo(() => {
    if (activeTab === 'day') {
      const dStr = activeDayDate.toLocaleDateString('en-CA');
      return { queryStartDate: dStr, queryEndDate: dStr };
    }
    if (activeTab === 'week') {
      return {
        queryStartDate: activeWeekStart.toLocaleDateString('en-CA'),
        queryEndDate: activeWeekEnd.toLocaleDateString('en-CA')
      };
    }
    return { queryStartDate: undefined, queryEndDate: undefined };
  }, [activeDayDate, activeWeekStart, activeWeekEnd, activeTab]);

  const { data: schools, isLoading: isLoadingSchools } = useSchools();
  const { data: classes, isLoading: isLoadingClasses } = useClasses(undefined, undefined, undefined, 1, 1000);
  const { data: teachers, isLoading: isLoadingTeachers } = useUsers('TEACHER', '', 1, 1000);
  const { data: assistants, isLoading: isLoadingAssistants } = useUsers('ASSISTANT', '', 1, 1000);
  const { data: sessions, isLoading: isLoadingSessions } = useSessions(queryStartDate, queryEndDate);
  const { data: reportsData, isLoading: isLoadingReports } = useReports(1, 1000);

  const isLoading = isLoadingSchools || isLoadingClasses || isLoadingTeachers || isLoadingAssistants || isLoadingSessions || isLoadingReports;

  const toggleSchool = (id: string) => setExpandedSchools(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleClass = (id: string) => setExpandedClasses(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleRole = (id: string) => setExpandedRoles(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleUser = (id: string) => setExpandedUsers(prev => ({ ...prev, [id]: !prev[id] }));

  // Build Hierarchy
  // Build Hierarchy
  const hierarchy = useMemo(() => {
    if (!schools?.items || !classes?.items || !sessions?.items) return [];

    let filteredSessions = sessions.items;
    const reportsList = reportsData?.items || [];

    // Tab Filtering
    if (activeTab === 'day') {
      const targetStr = activeDayDate.toLocaleDateString('en-CA');
      filteredSessions = filteredSessions.filter(s => {
        const sDateStr = new Date(s.sessionDate).toLocaleDateString('en-CA');
        return sDateStr === targetStr;
      });
    } else if (activeTab === 'week') {
      const startStr = activeWeekStart.toLocaleDateString('en-CA');
      const endStr = activeWeekEnd.toLocaleDateString('en-CA');
      
      filteredSessions = filteredSessions.filter(s => {
        const sDateStr = new Date(s.sessionDate).toLocaleDateString('en-CA');
        return sDateStr >= startStr && sDateStr <= endStr;
      });
    } else if (activeTab === 'discipline') {
      filteredSessions = [];
    }

    // Apply Real Time Status
    const getRealTimeStatus = (s: any) => {
      if (s.statusCode === 'CANCELED') return 'CANCELED';
      
      const rep = reportsList.find((r: any) => r.sessionId === s.id);
      if (rep && (rep.statusCode === 'SUBMITTED' || rep.statusCode === 'FINALIZED' || rep.status === 'SUBMITTED' || rep.status === 'FINALIZED')) {
        return 'COMPLETED';
      }
      if (rep && (rep.statusCode === 'DRAFT' || rep.status === 'DRAFT')) {
        return 'DRAFT';
      }

      const sDate = new Date(s.sessionDate).toLocaleDateString('en-CA');
      const todayStr = new Date().toLocaleDateString('en-CA');

      const now = new Date();
      const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

      const startParts = (s.startTime || '00:00').split(':');
      const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);

      const endParts = (s.endTime || '23:59').split(':');
      const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

      if (sDate < todayStr) return 'MISSING';
      if (sDate > todayStr) return 'SCHEDULED';

      // date is today
      if (currentTotalMinutes < startMinutes) return 'SCHEDULED';
      if (currentTotalMinutes > endMinutes) return 'MISSING';
      return 'ONGOING';
    };

    // 1. Group sessions by GroupId
    const groupedSessions: any[] = [];
    const groupsMap = new Map<string, any>();
    filteredSessions.forEach(s => {
      const sWithStatus = { ...s, computedStatus: getRealTimeStatus(s) };
      if (sWithStatus.groupId) {
        if (!groupsMap.has(sWithStatus.groupId)) {
          groupsMap.set(sWithStatus.groupId, { ...sWithStatus, classIds: [sWithStatus.classId] });
        } else {
          const g = groupsMap.get(sWithStatus.groupId);
          if (!g.classIds.includes(sWithStatus.classId)) g.classIds.push(sWithStatus.classId);
        }
      } else {
        groupedSessions.push({ ...sWithStatus, classIds: [sWithStatus.classId] });
      }
    });
    groupsMap.forEach(g => groupedSessions.push(g));

    return groupedSessions.sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [schools, classes, sessions, reportsData, activeTab, activeDayDate, activeWeekStart, activeWeekEnd]);

  return (
    <div className="w-full h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Báo cáo buổi học (Admin)</h2>
          <p className="text-edu-muted text-sm">
            {activeTab === 'day' && `Báo cáo giảng dạy ngày ${selectedDateStrForDisplay}`}
            {activeTab === 'week' && `Báo cáo giảng dạy tuần ${getWeekRangeDisplay()}`}
            {activeTab === 'discipline' && "Quản lý và theo dõi báo cáo giảng dạy theo từng cơ sở"}
          </p>
        </div>
        {activeTab === 'day' && (
          <div className="w-full sm:w-48">
            <DatePicker selected={activeDayDate} onChange={(date) => setSelectedDayDate(date)} />
          </div>
        )}
        {activeTab === 'week' && (
          <WeekPicker 
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedWeekIndex={selectedWeekIndex}
            onChange={(y, m, wIdx) => {
              setSelectedYear(y);
              setSelectedMonth(m);
              setSelectedWeekIndex(wIdx);
            }}
          />
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-edu-border overflow-x-auto hide-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('day')}
            className={`flex-1 sm:flex-none min-w-[120px] flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold rounded-lg transition-all ${activeTab === 'day' ? 'bg-edu-accent text-white shadow-md' : 'text-edu-muted hover:text-edu-fg hover:bg-edu-accentLighter'}`}
          >
            <ClipboardCheck size={16} /> Báo cáo Ngày
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`flex-1 sm:flex-none min-w-[120px] flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold rounded-lg transition-all ${activeTab === 'week' ? 'bg-edu-accent text-white shadow-md' : 'text-edu-muted hover:text-edu-fg hover:bg-edu-accentLighter'}`}
          >
            <Calendar size={16} /> Báo cáo Tuần
          </button>
          <button
            onClick={() => setActiveTab('discipline')}
            className={`flex-1 sm:flex-none min-w-[120px] flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold rounded-lg transition-all ${activeTab === 'discipline' ? 'bg-red-500 text-white shadow-md' : 'text-edu-muted hover:text-red-500 hover:bg-red-50'}`}
          >
            <AlertCircle size={16} /> Kỷ luật
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
          <Input 
            placeholder="Tìm kiếm..." 
            className="pl-9 bg-white border-edu-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden p-4 min-h-[calc(100vh-220px)]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-edu-accent mb-4 h-8 w-8" />
            <span className="text-edu-muted font-medium">Đang tải dữ liệu cấu trúc...</span>
          </div>
        ) : hierarchy.length === 0 ? (
          <EmptyState description={activeTab === 'discipline' ? "Chưa có báo cáo kỷ luật nào." : "Không có ca học nào trong khoảng thời gian này."} />
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full whitespace-nowrap">
              <TableHeader>
                <TableRow className="bg-slate-50 border-b-slate-200">
                  <TableHead className="text-sm font-semibold text-slate-500 h-11">Mã Lớp / Cơ sở</TableHead>
                  <TableHead className="text-sm font-semibold text-slate-500 h-11">Giáo viên / Trợ giảng</TableHead>
                  <TableHead className="text-sm font-semibold text-slate-500 h-11">Giờ học</TableHead>
                  <TableHead className="text-sm font-semibold text-slate-500 h-11">Chủ đề & Tiến độ</TableHead>
                  <TableHead className="text-sm font-semibold text-slate-500 h-11">Ghi chú</TableHead>
                  <TableHead className="text-sm font-semibold text-slate-500 h-11">Trạng thái</TableHead>
                  <TableHead className="text-sm font-semibold text-slate-500 h-11 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hierarchy.map((s: any) => {
                  const classNames = s.classIds?.map((cid: string) => {
                    const classObj = classes?.items?.find((c: any) => c.id === cid);
                    return classObj?.name || `${cid.substring(0, 8)}...`;
                  }).join(' + ') || '';
                  
                  const firstClass = classes?.items?.find((c: any) => s.classIds?.includes(c.id));
                  const schoolName = schools?.items?.find((sch: any) => sch.id === firstClass?.schoolId)?.name || '---';
                  const teacherName = teachers?.items?.find((t: any) => t.id === s.teacherId)?.fullName || 'Chưa xếp giáo viên';
                  const assistantName = (s.assistantIds && s.assistantIds.length > 0) ? s.assistantIds.map((id: string) => assistants?.items?.find((a: any) => a.id === id)?.fullName || 'Chưa xếp').join(', ') : null;
                  
                  const rep = reportsData?.items?.find((r: any) => r.sessionId === s.id);
                  const lessonTaught = rep?.lessonTaught || s.lessonTitle || '';
                  const progress = rep?.progress || s.lessonProgress || '';
                  const noteText = rep?.teacherComment || rep?.assistantNote || s.notes || '';

                  return (
                    <TableRow key={s.id} className="hover:bg-slate-50/70 transition-all duration-200 border-b-slate-100">
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="inline-flex items-center justify-center px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm rounded-md shadow-sm w-fit">
                            {classNames}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium ml-1">
                            <Building2 size={12} className="text-indigo-400" />
                            <span className="capitalize">{schoolName}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 text-slate-700 text-sm font-semibold">
                            <User size={14} className="text-blue-500" />
                            {teacherName}
                          </div>
                          {assistantName ? (
                            <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                              <Users size={12} className="text-teal-500" />
                              {assistantName}
                            </div>
                          ) : s.localTeachingAssistant ? (
                            <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                              <Users size={12} className="text-teal-500" />
                              TA: {s.localTeachingAssistant}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-sm ml-5">Chưa xếp trợ giảng</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1.5 items-start">
                          <div className="inline-flex items-center gap-1.5 text-slate-700 text-sm font-semibold">
                            <Calendar size={14} className="text-blue-500" />
                            {s.sessionDate ? new Date(s.sessionDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '---'}
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md shadow-sm font-bold text-sm">
                            <Clock size={13} className="text-blue-500" />
                            {s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1.5 max-w-[220px]">
                          <div className="flex items-start gap-1.5 text-slate-700 text-sm">
                            <BookOpen size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <span className="font-medium whitespace-normal line-clamp-2">{lessonTaught || <span className="text-slate-400 italic">Chưa cập nhật chủ đề</span>}</span>
                          </div>
                          {progress && (
                            <div className="text-sm text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded ml-5 whitespace-normal line-clamp-2">
                              {progress}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="max-w-[200px] whitespace-normal">
                          {noteText ? (
                            <span className="text-[13px] text-slate-600 line-clamp-3">{noteText}</span>
                          ) : (
                            <span className="text-[13px] text-slate-400 italic">---</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={s.computedStatus === 'COMPLETED' ? 'success' : s.computedStatus === 'DRAFT' ? 'info' : s.computedStatus === 'ONGOING' ? 'warn' : s.computedStatus === 'MISSING' ? 'danger' : 'muted'} className="shadow-sm">
                          {s.computedStatus === 'COMPLETED' ? 'Đã báo cáo' : s.computedStatus === 'DRAFT' ? 'Bản nháp' : s.computedStatus === 'ONGOING' ? 'Đang diễn ra' : s.computedStatus === 'MISSING' ? 'Chưa báo cáo' : 'Sắp tới'}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 font-semibold transition-all h-8 px-3 shadow-sm"
                          onClick={() => setSelectedSession(s)}
                        >
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ReportModal 
        isOpen={!!selectedSession} 
        onClose={() => setSelectedSession(null)} 
        session={selectedSession} 
      />
    </div>
  );
}
