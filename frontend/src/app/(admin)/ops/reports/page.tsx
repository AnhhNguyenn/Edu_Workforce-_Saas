'use client';

import { useState, useMemo } from 'react';
import { useSchools } from '@/hooks/queries/useSchools';
import { useClasses } from '@/hooks/queries/useClasses';
import { useUsers } from '@/hooks/queries/useUsers';
import { useSessions } from '@/hooks/queries/useSessions';
import { Search, ChevronDown, ChevronRight, Building2, GraduationCap, User, Calendar, ClipboardCheck, AlertCircle, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CenterAdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'discipline'>('day');
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for accordion expansion
  const [expandedSchools, setExpandedSchools] = useState<Record<string, boolean>>({});
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  const { data: schools, isLoading: isLoadingSchools } = useSchools();
  const { data: classes, isLoading: isLoadingClasses } = useClasses(undefined, undefined, 1, 1000);
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

    // Map Sessions to Classes
    const classSessionMap: Record<string, any[]> = {};
    filteredSessions.forEach(s => {
      if (!classSessionMap[s.classId]) classSessionMap[s.classId] = [];
      classSessionMap[s.classId].push(s);
    });

    // Map Classes to Schools
    const schoolNodes = schools.items.map(school => {
      const schoolClasses = classes.items.filter((c: any) => c.schoolId === school.id);
      
      const classNodes = schoolClasses.map((cls: any) => {
        const clsSessions = classSessionMap[cls.id] || [];
        
        // Group sessions by role and user
        const teacherSessionsMap: Record<string, any[]> = {};
        const assistantSessionsMap: Record<string, any[]> = {};
        
        clsSessions.forEach(s => {
          if (s.teacherId) {
            if (!teacherSessionsMap[s.teacherId]) teacherSessionsMap[s.teacherId] = [];
            teacherSessionsMap[s.teacherId].push(s);
          }
          if (s.assistantId) {
            if (!assistantSessionsMap[s.assistantId]) assistantSessionsMap[s.assistantId] = [];
            assistantSessionsMap[s.assistantId].push(s);
          }
        });

        const teacherNodes = Object.entries(teacherSessionsMap).map(([teacherId, tSessions]) => {
          const teacherInfo = teachers?.items?.find((t: any) => t.id === teacherId);
          return {
            id: teacherId,
            name: teacherInfo?.fullName || 'Không xác định',
            sessions: tSessions
          };
        });

        const assistantNodes = Object.entries(assistantSessionsMap).map(([assistantId, aSessions]) => {
          const assistantInfo = assistants?.items?.find((a: any) => a.id === assistantId);
          return {
            id: assistantId,
            name: assistantInfo?.fullName || 'Không xác định',
            sessions: aSessions
          };
        });

        return {
          id: cls.id,
          name: cls.name,
          teacherNodes,
          assistantNodes,
          totalSessions: clsSessions.length
        };
      }).filter(c => c.totalSessions > 0); // Only show classes with sessions

      return {
        id: school.id,
        name: school.name,
        classNodes,
        totalSessions: classNodes.reduce((acc, c) => acc + c.totalSessions, 0)
      };
    }).filter(s => s.totalSessions > 0); // Only show schools with sessions

    return schoolNodes;
  }, [schools, classes, sessions, teachers, assistants, activeTab]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden p-4 min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-edu-accent mb-4 h-8 w-8" />
            <span className="text-edu-muted font-medium">Đang tải dữ liệu cấu trúc...</span>
          </div>
        ) : hierarchy.length === 0 ? (
          <EmptyState description={activeTab === 'discipline' ? "Chưa có báo cáo kỷ luật nào." : "Không có ca học nào trong khoảng thời gian này."} />
        ) : (
          <div className="space-y-4">
            {hierarchy.map(school => (
              <div key={school.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleSchool(school.id)}
                >
                  <div className="flex items-center gap-3">
                    {expandedSchools[school.id] ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Building2 size={16} />
                    </div>
                    <span className="font-bold text-slate-800 text-base">{school.name}</span>
                  </div>
                  <Badge variant="muted" className="bg-white border-slate-200 text-slate-600">{school.totalSessions} ca học</Badge>
                </div>

                {expandedSchools[school.id] && (
                  <div className="pl-4 pr-3 pb-3 pt-1 space-y-3 border-t border-slate-100 bg-white">
                    {school.classNodes.map((cls: any) => (
                      <div key={cls.id} className="border border-slate-100 rounded-lg overflow-hidden shadow-sm">
                        <div 
                          className="flex items-center justify-between p-2.5 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
                          onClick={() => toggleClass(cls.id)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedClasses[cls.id] ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                            <GraduationCap size={16} className="text-orange-500" />
                            <span className="font-semibold text-slate-700 text-sm">{cls.name}</span>
                          </div>
                          <span className="text-xs font-medium text-slate-500">{cls.totalSessions} ca học</span>
                        </div>

                        {expandedClasses[cls.id] && (
                          <div className="pl-6 pr-3 pb-3 pt-2 space-y-3 bg-white border-t border-slate-100">
                            
                            {/* Teachers Section */}
                            {cls.teacherNodes.length > 0 && (
                              <div>
                                <div 
                                  className="flex items-center gap-2 mb-2 cursor-pointer group"
                                  onClick={() => toggleRole(`teacher_${cls.id}`)}
                                >
                                  {expandedRoles[`teacher_${cls.id}`] ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                  <span className="text-xs font-bold text-edu-muted uppercase group-hover:text-edu-fg transition-colors">Giáo viên</span>
                                </div>
                                {expandedRoles[`teacher_${cls.id}`] && (
                                  <div className="pl-5 space-y-2">
                                    {cls.teacherNodes.map((teacher: any) => (
                                      <div key={teacher.id} className="border border-slate-100 rounded-lg bg-slate-50/30 overflow-hidden">
                                        <div 
                                          className="flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-50"
                                          onClick={() => toggleUser(`t_${cls.id}_${teacher.id}`)}
                                        >
                                          {expandedUsers[`t_${cls.id}_${teacher.id}`] ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                          <User size={14} className="text-blue-500" />
                                          <span className="font-semibold text-sm text-slate-700">{teacher.name}</span>
                                          <span className="text-[11px] text-slate-400 ml-auto">{teacher.sessions.length} ca</span>
                                        </div>
                                        {expandedUsers[`t_${cls.id}_${teacher.id}`] && (
                                          <div className="p-3 pt-1 border-t border-slate-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {teacher.sessions.map((s: any) => (
                                              <div key={s.id} className="p-3 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                  <div className="font-bold text-sm text-slate-800">{s.lessonTitle || 'Lý thuyết'}</div>
                                                  <Badge variant={s.statusCode === 'COMPLETED' ? 'success' : 'warn'}>{s.statusCode}</Badge>
                                                </div>
                                                <div className="text-xs text-slate-500 space-y-1">
                                                  <div><span className="font-medium">Giờ:</span> {s.startTime.substring(0,5)} - {s.endTime.substring(0,5)}</div>
                                                  {s.localTeachingAssistant && <div><span className="font-medium">Trợ giảng CS:</span> {s.localTeachingAssistant}</div>}
                                                  {s.lessonProgress && <div><span className="font-medium">Tiến độ:</span> {s.lessonProgress}</div>}
                                                  {s.notes && <div><span className="font-medium">Nhận xét:</span> <span className="text-slate-700">{s.notes}</span></div>}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Assistants Section */}
                            {cls.assistantNodes.length > 0 && (
                              <div className="mt-3">
                                <div 
                                  className="flex items-center gap-2 mb-2 cursor-pointer group"
                                  onClick={() => toggleRole(`assistant_${cls.id}`)}
                                >
                                  {expandedRoles[`assistant_${cls.id}`] ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                  <span className="text-xs font-bold text-edu-muted uppercase group-hover:text-edu-fg transition-colors">Trợ giảng</span>
                                </div>
                                {expandedRoles[`assistant_${cls.id}`] && (
                                  <div className="pl-5 space-y-2">
                                    {cls.assistantNodes.map((assistant: any) => (
                                      <div key={assistant.id} className="border border-slate-100 rounded-lg bg-slate-50/30 overflow-hidden">
                                        <div 
                                          className="flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-50"
                                          onClick={() => toggleUser(`a_${cls.id}_${assistant.id}`)}
                                        >
                                          {expandedUsers[`a_${cls.id}_${assistant.id}`] ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                          <Users size={14} className="text-teal-500" />
                                          <span className="font-semibold text-sm text-slate-700">{assistant.name}</span>
                                          <span className="text-[11px] text-slate-400 ml-auto">{assistant.sessions.length} ca</span>
                                        </div>
                                        {expandedUsers[`a_${cls.id}_${assistant.id}`] && (
                                          <div className="p-3 pt-1 border-t border-slate-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {assistant.sessions.map((s: any) => (
                                              <div key={s.id} className="p-3 border border-slate-200 rounded-lg hover:border-teal-300 transition-colors shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                  <div className="font-bold text-sm text-slate-800">{s.lessonTitle || 'Lý thuyết'}</div>
                                                  <Badge variant={s.statusCode === 'COMPLETED' ? 'success' : 'warn'}>{s.statusCode}</Badge>
                                                </div>
                                                <div className="text-xs text-slate-500 space-y-1">
                                                  <div><span className="font-medium">Giờ:</span> {s.startTime.substring(0,5)} - {s.endTime.substring(0,5)}</div>
                                                  {s.localTeachingAssistant && <div><span className="font-medium">Trợ giảng CS:</span> {s.localTeachingAssistant}</div>}
                                                  {s.lessonProgress && <div><span className="font-medium">Tiến độ:</span> {s.lessonProgress}</div>}
                                                  {s.notes && <div><span className="font-medium">Nhận xét:</span> <span className="text-slate-700">{s.notes}</span></div>}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
