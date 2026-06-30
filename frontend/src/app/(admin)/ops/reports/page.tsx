'use client';

import { useState, useMemo } from 'react';
import { useSchools } from '@/hooks/queries/useSchools';
import { useClasses } from '@/hooks/queries/useClasses';
import { useUsers } from '@/hooks/queries/useUsers';
import { useSessions } from '@/hooks/queries/useSessions';
import { Search, ChevronDown, ChevronRight, Building2, GraduationCap, User, Calendar, ClipboardCheck, AlertCircle, Users, Loader2, BookOpen, UserCheck, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { ReportModal } from './_components/ReportModal';

export default function CenterAdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'discipline'>('day');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  
  // States for accordion expansion
  const [expandedSchools, setExpandedSchools] = useState<Record<string, boolean>>({});
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  const { data: schools, isLoading: isLoadingSchools } = useSchools();
  const { data: classes, isLoading: isLoadingClasses } = useClasses(undefined, undefined, undefined, 1, 1000);
  const { data: teachers, isLoading: isLoadingTeachers } = useUsers('TEACHER', '', 1, 1000);
  const { data: assistants, isLoading: isLoadingAssistants } = useUsers('ASSISTANT', '', 1, 1000);
  const { data: sessions, isLoading: isLoadingSessions } = useSessions();

  const isLoading = isLoadingSchools || isLoadingClasses || isLoadingTeachers || isLoadingAssistants || isLoadingSessions;

  const toggleSchool = (id: string) => setExpandedSchools(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleClass = (id: string) => setExpandedClasses(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleRole = (id: string) => setExpandedRoles(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleUser = (id: string) => setExpandedUsers(prev => ({ ...prev, [id]: !prev[id] }));

  // Build Hierarchy
  const hierarchy = useMemo(() => {
    if (!schools?.items || !classes?.items || !sessions?.items) return [];

    let filteredSessions = sessions.items;

    // Tab Filtering
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (activeTab === 'day') {
      const todayStr = today.toLocaleDateString('en-CA');
      filteredSessions = filteredSessions.filter(s => {
        const sDateStr = new Date(s.sessionDate).toLocaleDateString('en-CA');
        return sDateStr === todayStr;
      });
    } else if (activeTab === 'week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const startStr = weekStart.toLocaleDateString('en-CA');
      const endStr = weekEnd.toLocaleDateString('en-CA');
      
      filteredSessions = filteredSessions.filter(s => {
        const sDateStr = new Date(s.sessionDate).toLocaleDateString('en-CA');
        return sDateStr >= startStr && sDateStr <= endStr;
      });
    } else if (activeTab === 'discipline') {
      // Dummy logic for discipline: only sessions with notes containing specific keywords?
      // Or just empty for now as it's a placeholder
      filteredSessions = [];
    }

    // Apply Real Time Status
    const getRealTimeStatus = (s: any) => {
      if (s.statusCode === 'CANCELED') return 'CANCELED';
      if (s.statusCode === 'COMPLETED') return 'COMPLETED';
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
  }, [schools, classes, sessions, teachers, assistants, activeTab]);

  return (
    <div className="w-full h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Báo cáo buổi học (Admin)</h2>
          <p className="text-edu-muted text-sm">Quản lý và theo dõi báo cáo giảng dạy theo từng cơ sở</p>
        </div>
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
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md shadow-sm font-bold text-sm">
                          <Clock size={13} className="text-blue-500" />
                          {s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1.5 max-w-[220px]">
                          <div className="flex items-start gap-1.5 text-slate-700 text-sm">
                            <BookOpen size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <span className="font-medium whitespace-normal line-clamp-2">{s.lessonTitle || <span className="text-slate-400 italic">Chưa cập nhật chủ đề</span>}</span>
                          </div>
                          {s.lessonProgress && (
                            <div className="text-sm text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded ml-5 whitespace-normal line-clamp-2">
                              {s.lessonProgress}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="max-w-[200px] whitespace-normal">
                          {s.notes ? (
                            <span className="text-[13px] text-slate-600 line-clamp-3">{s.notes}</span>
                          ) : (
                            <span className="text-[13px] text-slate-400 italic">---</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={s.computedStatus === 'COMPLETED' ? 'success' : s.computedStatus === 'ONGOING' ? 'warn' : s.computedStatus === 'MISSING' ? 'secondary' : 'info'} className="shadow-sm">
                          {s.computedStatus === 'COMPLETED' ? 'Đã xong' : s.computedStatus === 'ONGOING' ? 'Đang diễn ra' : s.computedStatus === 'MISSING' ? 'Chưa báo cáo' : 'Sắp tới'}
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
