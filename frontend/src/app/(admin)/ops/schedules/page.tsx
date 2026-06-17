'use client';

import { useSessions, useCreateSession, useUpdateSession, useDeleteSession } from "@/hooks/queries/useSessions";
import { useClasses } from "@/hooks/queries/useClasses";
import { useUsers } from "@/hooks/queries/useUsers";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader2, CalendarPlus, Clock, PenBox, Calendar, Trash2, MoreVertical, User, MapPin, X, ChevronLeft, ChevronRight, SlidersHorizontal, Sun, Moon, Users, Search } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { useProfile } from '@/hooks/queries/useProfile';
import { useConfirm } from '@/providers/ConfirmProvider';

const COLOR_THEMES = [
  { text: 'text-blue-600', textLight: 'text-blue-500', border: 'border-blue-300', bg: 'bg-white', iconBg: 'bg-blue-600', hover: 'hover:border-blue-400' },
  { text: 'text-emerald-600', textLight: 'text-emerald-500', border: 'border-emerald-300', bg: 'bg-white', iconBg: 'bg-emerald-500', hover: 'hover:border-emerald-400' },
  { text: 'text-purple-600', textLight: 'text-purple-500', border: 'border-purple-300', bg: 'bg-white', iconBg: 'bg-purple-600', hover: 'hover:border-purple-400' },
  { text: 'text-orange-600', textLight: 'text-orange-500', border: 'border-orange-300', bg: 'bg-white', iconBg: 'bg-orange-500', hover: 'hover:border-orange-400' },
  { text: 'text-teal-600', textLight: 'text-teal-500', border: 'border-teal-300', bg: 'bg-white', iconBg: 'bg-teal-500', hover: 'hover:border-teal-400' },
  { text: 'text-rose-600', textLight: 'text-rose-500', border: 'border-rose-300', bg: 'bg-white', iconBg: 'bg-rose-600', hover: 'hover:border-rose-400' },
];

const SHIFTS = [
  { id: 'morning', label: 'Sáng', time: '07:00 - 12:00', icon: Sun, defaultStart: '07:00:00', defaultEnd: '09:00:00' },
  { id: 'afternoon', label: 'Chiều', time: '13:00 - 17:00', icon: Sun, defaultStart: '13:30:00', defaultEnd: '15:30:00' },
  { id: 'evening', label: 'Tối', time: '18:00 - 22:00', icon: Moon, defaultStart: '18:00:00', defaultEnd: '20:00:00' }
];

const getErrorMessage = (err: any) => {
  if (err?.response?.data) {
    const data = err.response.data;
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.Message) return data.Message;
    if (data.detail) return data.detail;
    if (data.Detail) return data.Detail;
    if (data.title && data.title !== 'One or more validation errors occurred.') return data.title;
    if (data.Title && data.Title !== 'One or more validation errors occurred.') return data.Title;
    if (data.error) return data.error;
    if (data.Error) return data.Error;
    if (data.errors) {
      const firstError = Object.values(data.errors)[0];
      if (Array.isArray(firstError)) return firstError[0] as string;
      return firstError as string;
    }
    if (data.Errors) {
      const firstError = Object.values(data.Errors)[0];
      if (Array.isArray(firstError)) return firstError[0] as string;
      return firstError as string;
    }
  }
  return err?.message || 'Lỗi không xác định';
};

const translateError = (msg: string) => {
  if (!msg) return 'Lỗi không xác định';
  if (msg.includes('Teacher or Assistant is already assigned to another session at this time')) {
    return 'Giáo viên hoặc Trợ giảng đã có lịch dạy trong khoảng thời gian này!';
  } else if (msg.includes('Room is already assigned')) {
    return 'Phòng học đã được sử dụng trong khoảng thời gian này!';
  }
  return msg;
};

export default function SchedulesPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [activeTab, setActiveTab] = useState<'class' | 'teacher' | 'assistant'>('class');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [classPage, setClassPage] = useState(1);
  const [teacherPage, setTeacherPage] = useState(1);
  const [assistantPage, setAssistantPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchKeyword), 300);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const handleTabChange = (tab: 'class' | 'teacher' | 'assistant') => {
    setActiveTab(tab);
    setSearchKeyword('');
    setDebouncedSearch('');
  };

  const { data: sessions, isLoading } = useSessions();
  const { data: classes } = useClasses(activeTab === 'class' ? debouncedSearch : '', undefined, classPage, PAGE_SIZE);
  const { data: teachers } = useUsers('TEACHER', activeTab === 'teacher' ? debouncedSearch : '', teacherPage, PAGE_SIZE);
  const { data: assistants } = useUsers('ASSISTANT', activeTab === 'assistant' ? debouncedSearch : '', assistantPage, PAGE_SIZE);

  const getCurrentPage = () => {
    if (activeTab === 'class') return classPage;
    if (activeTab === 'teacher') return teacherPage;
    return assistantPage;
  };

  const getTotalPages = () => {
    if (activeTab === 'class') return Math.ceil((classes?.totalCount || 0) / PAGE_SIZE);
    if (activeTab === 'teacher') return Math.ceil((teachers?.totalCount || 0) / PAGE_SIZE);
    return Math.ceil((assistants?.totalCount || 0) / PAGE_SIZE);
  };

  const handlePageChange = (delta: number) => {
    if (activeTab === 'class') setClassPage(p => p + delta);
    if (activeTab === 'teacher') setTeacherPage(p => p + delta);
    if (activeTab === 'assistant') setAssistantPage(p => p + delta);
  };

  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const { confirm } = useConfirm();

  const [editingSessionId, setEditingSessionId] = useState<string>('');
  const [selectedSessionInfo, setSelectedSessionInfo] = useState<any>(null);



  const [sessionForm, setSessionForm] = useState({
    classId: '', teacherId: '', assistantId: '', lessonTitle: '', roomName: '', sessionDate: '', startTime: '', endTime: ''
  });

  const { data: profile } = useProfile();
  const isAuthorized = profile?.role === 'SUPER_ADMIN' || profile?.role === 'CENTER_ADMIN';

  const getClassTheme = (classId: string) => {
    if (!classes?.items) return COLOR_THEMES[0];
    const index = classes.items.findIndex((c: any) => c.id === classId);
    return COLOR_THEMES[Math.max(0, index) % COLOR_THEMES.length];
  };

  const getShiftIndex = (timeStr: string) => {
    if (!timeStr) return 1;
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour < 12) return 1;
    if (hour < 17) return 2;
    return 3;
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const goToday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    setCurrentWeekStart(d);
  };

  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getShiftForTime = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0], 10);
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  // Build sessionsByDate
  const shiftStats = { morning: 0, afternoon: 0, evening: 0 };
  const sessionsByDate: Record<string, any[]> = {};

  daysOfWeek.forEach(d => {
    const dStr = d.toLocaleDateString('en-CA');
    sessionsByDate[dStr] = [];
  });

  sessions?.items?.forEach((s: any) => {
    const dStr = new Date(s.sessionDate).toLocaleDateString('en-CA');
    if (sessionsByDate[dStr]) {
      const className = classes?.items?.find((c: any) => c.id === s.classId)?.name || s.classId?.substring(0, 8);
      const teacherName = teachers?.items?.find((t: any) => t.id === s.teacherId)?.fullName || 'Chưa xếp';
      const assistantName = assistants?.items?.find((a: any) => a.id === s.assistantId)?.fullName || 'Chưa xếp';
      const theme = getClassTheme(s.classId);

      sessionsByDate[dStr].push({ ...s, className, teacherName, assistantName, theme });

      const startIdx = getShiftIndex(s.startTime);
      const endIdx = getShiftIndex(s.endTime);

      if (startIdx <= 1 && endIdx >= 1) shiftStats.morning++;
      if (startIdx <= 2 && endIdx >= 2) shiftStats.afternoon++;
      if (startIdx <= 3 && endIdx >= 3) shiftStats.evening++;
    }
  });

  const handleDropOnCell = async (e: React.DragEvent, dateStr: string, shiftId: string, targetSession?: any) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50/50');
    if (!isAuthorized) return;

    const dragType = e.dataTransfer.getData('type');
    const dragId = e.dataTransfer.getData('id');

    if (dragType === 'teacher' || dragType === 'assistant') {
      if (!targetSession) {
        toast.error('Vui lòng thả vào một ca học cụ thể để phân công!');
        return;
      }
      
      const payload = {
        classId: targetSession.classId,
        sessionDate: dateStr,
        startTime: targetSession.startTime,
        endTime: targetSession.endTime,
        teacherId: dragType === 'teacher' ? dragId : targetSession.teacherId,
        assistantId: dragType === 'assistant' ? dragId : targetSession.assistantId,
        lessonTitle: targetSession.lessonTitle
      };

      try {
        await updateSession.mutateAsync({
          id: targetSession.id,
          data: payload
        });
        toast.success(`Đã phân công ${dragType === 'teacher' ? 'giáo viên' : 'trợ giảng'} thành công!`);
        if (selectedSessionInfo?.id === targetSession.id) {
           setSelectedSessionInfo(null);
        }
      } catch (err: any) {
        toast.error(translateError(getErrorMessage(err)));
      }
      return;
    }

    if (dragType === 'class') {
      const shiftData = SHIFTS.find(s => s.id === shiftId);
      try {
        await createSession.mutateAsync({
          classId: dragId,
          teacherId: null,
          assistantId: null,
          sessionDate: dateStr,
          startTime: shiftData?.defaultStart || '07:00:00',
          endTime: shiftData?.defaultEnd || '09:00:00'
        });
        toast.success('Đã tạo lịch học nhanh!');
      } catch (err: any) {
        toast.error(translateError(getErrorMessage(err)));
      }
    } else if (dragType === 'session') {
      const sessionData = JSON.parse(e.dataTransfer.getData('sessionData'));
      const oldShift = getShiftForTime(sessionData.startTime);

      // If dropped in a different shift, update time to default for that shift.
      // If same shift, keep exact old time.
      const shiftObj = SHIFTS.find(s => s.id === shiftId);
      let newStart = sessionData.startTime;
      let newEnd = sessionData.endTime;

      if (oldShift !== shiftId) {
        // Keep duration but move to new shift
        const startD = new Date(`2000-01-01T${sessionData.startTime}`);
        const endD = new Date(`2000-01-01T${sessionData.endTime}`);
        const durationMs = endD.getTime() - startD.getTime();

        newStart = shiftObj?.defaultStart || newStart;
        const newStartD = new Date(`2000-01-01T${newStart}`);
        const newEndD = new Date(newStartD.getTime() + durationMs);
        newEnd = newEndD.toTimeString().split(' ')[0];
      }

      try {
        await updateSession.mutateAsync({
          id: sessionData.id,
          data: {
            classId: sessionData.classId,
            teacherId: sessionData.teacherId,
            assistantId: sessionData.assistantId,
            lessonTitle: sessionData.lessonTitle,
            sessionDate: dateStr,
            startTime: newStart,
            endTime: newEnd
          }
        });
        toast.success('Đã di chuyển ca học!');
        if (selectedSessionInfo?.id === sessionData.id) {
          setSelectedSessionInfo(null);
        }
      } catch (err: any) {
        toast.error(translateError(getErrorMessage(err)));
      }
    }
  };

  const handleSave = async () => {
    if (!sessionForm.classId || !sessionForm.teacherId || !sessionForm.sessionDate || !sessionForm.startTime || !sessionForm.endTime) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    try {
      const payload = {
        ...sessionForm,
        teacherId: sessionForm.teacherId === '' ? null : sessionForm.teacherId,
        assistantId: sessionForm.assistantId === '' ? null : sessionForm.assistantId,
        startTime: sessionForm.startTime.length === 5 ? sessionForm.startTime + ':00' : sessionForm.startTime,
        endTime: sessionForm.endTime.length === 5 ? sessionForm.endTime + ':00' : sessionForm.endTime,
      };

      if (modalMode === 'create') {
        await createSession.mutateAsync(payload);
        toast.success('Đã tạo lịch học mới');
      } else {
        await updateSession.mutateAsync({ id: editingSessionId, data: payload });
        toast.success('Đã cập nhật lịch học');
        setSelectedSessionInfo(null);
      }
      setIsModalOpen(false);
    } catch (e: any) {
      toast.error(translateError(getErrorMessage(e)) || 'Lỗi khi lưu lịch học');
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "Xóa Lịch học",
      description: "Bạn có chắc chắn muốn xóa buổi học này không?",
      requireInput: false,
      action: async () => {
        try {
          await deleteSession.mutateAsync(id);
          toast.success('Đã xóa buổi học');
          setIsModalOpen(false);
          setSelectedSessionInfo(null);
        } catch (error: any) {
          toast.error(translateError(getErrorMessage(error)) || 'Lỗi khi xóa buổi học');
        }
      }
    });
  };

  const weekTitle = `${daysOfWeek[0].getDate()} - ${daysOfWeek[6].getDate()} Thg ${daysOfWeek[6].getMonth() + 1}, ${daysOfWeek[6].getFullYear()}`;

  return (
    <div className="max-w-[1800px] mx-auto p-2 md:p-6 flex flex-col min-h-[calc(100vh-70px)] xl:h-[calc(100vh-70px)] bg-[#F8FAFC] xl:overflow-hidden">

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3 shrink-0 mb-3 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 md:p-2.5 rounded-xl border border-emerald-200 shrink-0">
            <Calendar className="text-emerald-600 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h2 className="text-[18px] md:text-[22px] font-bold text-slate-800 leading-none mb-1">
              Xếp lịch giảng dạy
            </h2>
            <p className="text-slate-500 text-[12px] md:text-[13px] font-medium">Kéo thả để xếp ca học</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm h-10 w-full sm:w-auto justify-between">
            <Button variant="ghost" size="icon" className="h-full w-8 rounded-md hover:bg-slate-100 shrink-0" onClick={prevWeek}>
              <ChevronLeft size={16} className="text-slate-600" />
            </Button>
            <div className="px-2 md:px-4 font-bold text-slate-700 text-[13px] md:text-[14px] text-center cursor-pointer hover:text-[#2563EB] transition-colors truncate" onClick={goToday}>
              {weekTitle}
            </div>
            <Button variant="ghost" size="icon" className="h-full w-8 rounded-md hover:bg-slate-100 shrink-0" onClick={nextWeek}>
              <ChevronRight size={16} className="text-slate-600" />
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm h-10 px-3">
              <SlidersHorizontal size={14} className="mr-1.5 md:mr-2" /> <span className="text-[13px] md:text-[14px]">Bộ lọc</span>
            </Button>

            <Button
              onClick={() => {
                setSessionForm({ classId: '', teacherId: '', assistantId: '', lessonTitle: '', sessionDate: '', startTime: '', endTime: '' });
                setModalMode('create');
                setIsModalOpen(true);
              }}
              className="flex-1 sm:flex-none bg-white text-[#2563EB] border border-gray-200 hover:border-[#2563EB] hover:bg-blue-50 active:scale-95 transition-all rounded-lg px-3 h-10 shadow-sm font-semibold"
            >
              <CalendarPlus size={14} className="mr-1.5 md:mr-2" /> <span className="text-[13px] md:text-[14px]">Thêm ca học</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-3 md:gap-6 items-start flex-1 min-h-0">

        {/* Left Sidebar */}
        <div 
          className="w-full xl:w-[240px] flex-shrink-0 flex flex-col h-[220px] md:h-[260px] xl:h-full bg-white xl:bg-transparent rounded-3xl xl:rounded-none border border-slate-100 xl:border-none p-3 xl:p-0 shadow-sm xl:shadow-none transition-all relative"
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes('application/x-eduops-session')) {
              e.preventDefault();
              e.currentTarget.classList.add('bg-red-50', 'ring-2', 'ring-red-400');
            }
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('bg-red-50', 'ring-2', 'ring-red-400');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('bg-red-50', 'ring-2', 'ring-red-400');
            const dragType = e.dataTransfer.getData('type');
            if (dragType === 'session') {
              const sessionData = JSON.parse(e.dataTransfer.getData('sessionData'));
              handleDelete(sessionData.id);
            }
          }}
        >
          <div className="flex bg-slate-100/80 p-1 rounded-xl mb-3 shrink-0">
            <button 
              onClick={() => handleTabChange('class')}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${activeTab === 'class' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Lớp
            </button>
            <button 
              onClick={() => handleTabChange('teacher')}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${activeTab === 'teacher' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Giáo viên
            </button>
            <button 
              onClick={() => handleTabChange('assistant')}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${activeTab === 'assistant' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Trợ giảng
            </button>
          </div>

          <div className="mb-3 shrink-0 flex gap-2 items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder={`Tìm ${activeTab === 'class' ? 'lớp' : activeTab === 'teacher' ? 'giáo viên' : 'trợ giảng'}...`}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[13px] font-medium focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors shadow-sm"
              />
            </div>
            <div className="flex bg-white border border-slate-200 rounded-lg shadow-sm shrink-0 overflow-hidden">
              <button 
                disabled={getCurrentPage() <= 1}
                onClick={() => handlePageChange(-1)}
                className="p-1.5 text-slate-600 hover:bg-slate-50 border-r border-slate-200 disabled:opacity-30 transition-colors"
                title="Trang trước"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                disabled={getCurrentPage() >= (getTotalPages() || 1)}
                onClick={() => handlePageChange(1)}
                className="p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                title="Trang sau"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 pr-1">
            {activeTab === 'class' && classes?.items?.map((c: any) => {
              const theme = getClassTheme(c.id);
              return (
                <div
                  key={c.id}
                  draggable={isAuthorized}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('type', 'class');
                    e.dataTransfer.setData('id', c.id);
                  }}
                  className="flex items-center p-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl cursor-grab active:cursor-grabbing transition-all group shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px] mr-3 shrink-0 ${theme.iconBg} text-white uppercase`}>
                    {c.name.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px] text-slate-800 truncate uppercase leading-tight">{c.name}</div>
                    <div className="text-[12px] text-slate-500 font-medium truncate mt-0.5">Lý thuyết</div>
                  </div>
                  <MoreVertical size={16} className="text-slate-400 group-hover:text-slate-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
            
            {activeTab === 'teacher' && teachers?.items?.map((t: any) => (
              <div
                key={t.id}
                draggable={isAuthorized}
                onDragStart={(e) => {
                  e.dataTransfer.setData('type', 'teacher');
                  e.dataTransfer.setData('id', t.id);
                }}
                className="flex items-center p-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl cursor-grab active:cursor-grabbing transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mr-3 shrink-0">
                  <User size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[13px] text-slate-800 truncate">{t.fullName}</div>
                  <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{t.email}</div>
                </div>
              </div>
            ))}

            {activeTab === 'assistant' && assistants?.items?.map((a: any) => (
              <div
                key={a.id}
                draggable={isAuthorized}
                onDragStart={(e) => {
                  e.dataTransfer.setData('type', 'assistant');
                  e.dataTransfer.setData('id', a.id);
                }}
                className="flex items-center p-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl cursor-grab active:cursor-grabbing transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 mr-3 shrink-0">
                  <Users size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[13px] text-slate-800 truncate">{a.fullName}</div>
                  <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{a.email}</div>
                </div>
              </div>
            ))}
          </div>



          <div className="mt-2 p-2 bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl shrink-0">
            <div className="flex items-start gap-1.5 text-[#1E40AF] text-[11px]">
              <div className="w-3.5 h-3.5 rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0 font-bold text-[8px] mt-0.5">i</div>
              <p className="leading-tight font-medium">
                {activeTab === 'class' ? 'Kéo lớp sang ca học để xếp lịch' : 'Kéo thả lên ca học để phân công'}
              </p>
            </div>
          </div>
        </div>

        {/* Matrix Board */}
        <div className="flex-1 w-full min-w-0 flex flex-col xl:h-full overflow-x-auto custom-scrollbar bg-white border border-slate-100 rounded-3xl shadow-sm">
          <div className="min-w-[800px] flex flex-col min-h-full">
            {/* Header Row */}
            <div className="grid grid-cols-[80px_1fr_1fr_1fr] border-b border-slate-100 bg-white shrink-0">
            <div className="p-3 border-r border-slate-100"></div>
            {SHIFTS.map(shift => (
              <div key={shift.id} className="p-3 border-r border-slate-100 last:border-r-0 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <shift.icon size={16} className={shift.id === 'evening' ? 'text-indigo-500' : 'text-orange-500 fill-orange-500'} />
                  <span className="font-bold text-[14px] text-slate-800">{shift.label}</span>
                  <span className="text-[12px] text-slate-500 font-medium">({shift.time})</span>
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  {shiftStats[shift.id as keyof typeof shiftStats]} lớp
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center h-full"><Loader2 className="animate-spin text-[#2563EB] mb-4 h-10 w-10" /> <span className="text-slate-500 font-medium">Đang tải lịch điều phối...</span></div>
            ) : (
              <div className="flex flex-col min-h-full">
                {daysOfWeek.map((day, idx) => {
                  const dateStr = day.toLocaleDateString('en-CA');
                  const isToday = new Date().toLocaleDateString('en-CA') === dateStr;
                  const dayName = idx === 6 ? 'Chủ nhật' : `Thứ ${idx + 2}`;

                  const daySessions = sessionsByDate[dateStr] || [];
                  const hasSessions = daySessions.length > 0;

                  return (
                    <div key={dateStr} className="grid grid-cols-[80px_1fr] border-b border-slate-100 last:border-b-0 flex-1 min-h-[80px]">
                      {/* Row Header */}
                      <div className={`border-r border-slate-100 flex flex-col items-center justify-center text-center p-2 ${isToday ? 'bg-[#EFF6FF]' : ''}`}>
                        <div className={`font-bold text-[13px] ${isToday ? 'text-[#2563EB]' : 'text-slate-700'}`}>{dayName}</div>
                        <div className={`text-[11px] font-medium ${isToday ? 'text-[#1D4ED8]' : 'text-slate-400'} mt-0.5`}>
                          {day.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }).replace('/', '/')}
                        </div>
                      </div>

                      {/* Main Content Area */}
                      <div className="relative grid grid-cols-3">
                        {/* Interactive Drop Zones (Background) */}
                        <div className="absolute inset-0 grid grid-cols-3 z-0 pointer-events-auto">
                          {SHIFTS.map((shift, idx) => {
                            const shiftSessions = daySessions.filter(s => getShiftIndex(s.startTime) === idx + 1);
                            return (
                              <div
                                key={`bg-${shift.id}`}
                                className={`border-slate-100 ${idx < 2 ? 'border-r' : ''} transition-colors flex items-center justify-center p-2`}
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-blue-50/50'); }}
                                onDragLeave={(e) => { e.currentTarget.classList.remove('bg-blue-50/50'); }}
                                onDrop={(e) => { e.currentTarget.classList.remove('bg-blue-50/50'); handleDropOnCell(e, dateStr, shift.id); }}
                              >
                                {shiftSessions.length === 0 && (
                                  <div className="w-full flex items-center justify-center py-2 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-slate-300 hover:text-[#2563EB] rounded-lg">
                                    <span className="text-[12px] font-medium pointer-events-none">+ Kéo lớp vào đây</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Sessions Grid (Foreground) */}
                        <div className="col-span-3 grid grid-cols-3 grid-flow-dense gap-2 p-2 relative z-10 pointer-events-none">
                          {[...daySessions].sort((a, b) => a.startTime.localeCompare(b.startTime)).map(session => {
                            const startCol = getShiftIndex(session.startTime);
                            const endCol = getShiftIndex(session.endTime);
                            const span = Math.max(1, endCol - startCol + 1);
                            const theme = getClassTheme(session.classId);

                            const getColStart = (col: number) => col === 1 ? 'col-start-1' : col === 2 ? 'col-start-2' : 'col-start-3';
                            const getColSpan = (s: number) => s === 3 ? 'col-span-3' : s === 2 ? 'col-span-2' : 'col-span-1';

                            const colClass = `${getColStart(startCol)} ${getColSpan(span)}`;

                            return (
                              <div
                                key={session.id}
                                draggable={isAuthorized}
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('type', 'session');
                                  e.dataTransfer.setData('sessionData', JSON.stringify(session));
                                  e.dataTransfer.setData('application/x-eduops-session', 'true');
                                }}
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDropOnCell(e, dateStr, getShiftForTime(session.startTime), session);
                                }}
                                onClick={() => setSelectedSessionInfo(session)}
                                className={`${colClass} pointer-events-auto bg-white border rounded-md p-2 shadow-sm cursor-grab active:cursor-grabbing transition-all group ${theme.border} ${theme.hover}`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <div className="flex gap-1.5 items-center min-w-0">
                                    <div className={`font-bold text-[12px] leading-none uppercase ${theme.text}`}>{session.className}</div>
                                    <div className={`font-semibold text-[11px] leading-none ${theme.textLight}`}>{session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}</div>
                                  </div>
                                  <MoreVertical size={13} className={`${theme.textLight} opacity-50 group-hover:opacity-100 transition-opacity shrink-0 ml-1`} />
                                </div>
                                <div className={`flex items-center gap-2 mb-1.5 ${theme.text}`}>
                                  <div className="text-[11px] font-medium leading-tight truncate">{session.lessonTitle || 'Lý thuyết'}</div>
                                  <div className="flex items-center gap-1 shrink-0 text-[10px] font-medium opacity-80"><MapPin size={10} className="shrink-0" /> <span className="truncate">{session.roomName || 'Chưa xếp'}</span></div>
                                </div>
                                <div className={`flex flex-col gap-1.5 text-[10px] font-medium ${theme.textLight}`}>
                                  <div className="flex items-center gap-1.5 min-w-0" title={`GV: ${session.teacherName}`}>
                                    <User size={11} className="shrink-0" /> 
                                    <span className="truncate">{session.teacherName !== 'Chưa xếp' ? session.teacherName : 'Chưa xếp'}</span>
                                  </div>
                                  {session.assistantName && session.assistantName !== 'Chưa xếp' && (
                                    <div className="flex items-center gap-1.5 min-w-0" title={`TG: ${session.assistantName}`}>
                                      <Users size={11} className="shrink-0" /> 
                                      <span className="truncate">{session.assistantName}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Legend Row */}
            <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex flex-wrap gap-3 items-center justify-center shrink-0">
              {classes?.items?.map((c: any) => {
                const theme = getClassTheme(c.id);
                return (
                  <div key={`legend-${c.id}`} className="flex items-center gap-1.5">
                    <div className={`px-1.5 py-0.5 rounded-[4px] text-[11px] font-bold uppercase text-white ${theme.iconBg}`}>
                      {c.name.substring(0, 2)}
                    </div>
                    <span className="text-[12px] font-medium text-slate-600">Lý thuyết</span>
                  </div>
                )
              })}
            </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Details */}
        {selectedSessionInfo && (
          <div className="w-full xl:w-[300px] flex-shrink-0 flex flex-col h-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-200">
            <div className="px-4 py-3 flex justify-between items-center border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-[14px]">Chi tiết ca học</h3>
              <button onClick={() => setSelectedSessionInfo(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full p-1">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-7 custom-scrollbar">
              <div className="flex items-center gap-4 border border-slate-100 p-3 rounded-2xl bg-slate-50/50">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-[15px] shrink-0 bg-white border ${selectedSessionInfo.theme.border} ${selectedSessionInfo.theme.text} uppercase`}>
                  {selectedSessionInfo.className}
                </div>
                <div className="text-slate-700 font-semibold text-[15px]">
                  {selectedSessionInfo.lessonTitle || 'Lý thuyết'}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-[12px] font-medium text-slate-400 mb-2.5">Thời gian</div>
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-slate-400 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800 text-[15px] leading-tight">
                        {selectedSessionInfo.startTime.substring(0, 5)} - {selectedSessionInfo.endTime.substring(0, 5)}
                      </div>
                      <div className="text-[13px] font-medium text-slate-500 mt-1">
                        {new Date(selectedSessionInfo.sessionDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[12px] font-medium text-slate-400 mb-2.5">Giáo viên</div>
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-blue-500" />
                    <span className="font-bold text-slate-800 text-[15px]">{selectedSessionInfo.teacherName}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[12px] font-medium text-slate-400 mb-2.5">Trợ giảng</div>
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-teal-500" />
                    <span className="font-bold text-slate-800 text-[15px]">{selectedSessionInfo.assistantName}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[12px] font-medium text-slate-400 mb-2.5">Phòng học</div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-blue-500" />
                    <span className="font-bold text-slate-800 text-[15px]">{selectedSessionInfo.roomName || 'Chưa xếp'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[12px] font-medium text-slate-400 mb-2.5">Sĩ số dự kiến</div>
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-slate-400" />
                    <span className="font-bold text-slate-800 text-[15px]">20 học viên</span>
                  </div>
                </div>

                <div>
                  <div className="text-[12px] font-medium text-slate-400 mb-2.5">Ghi chú</div>
                  <div className="text-[14px] text-slate-800 font-medium">-</div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-50 flex flex-col gap-3 shrink-0">
              <Button
                onClick={() => {
                  setSessionForm({
                    classId: selectedSessionInfo.classId || '',
                    teacherId: selectedSessionInfo.teacherId || '',
                    assistantId: selectedSessionInfo.assistantId || '',
                    lessonTitle: selectedSessionInfo.lessonTitle || '',
                    roomName: selectedSessionInfo.roomName || '',
                    sessionDate: new Date(selectedSessionInfo.sessionDate).toLocaleDateString('en-CA'),
                    startTime: selectedSessionInfo.startTime,
                    endTime: selectedSessionInfo.endTime
                  });
                  setModalMode('edit');
                  setEditingSessionId(selectedSessionInfo.id);
                  setIsModalOpen(true);
                }}
                className="w-full bg-white text-[#2563EB] border border-gray-200 hover:border-[#2563EB] hover:bg-blue-50 active:scale-95 transition-all rounded-xl h-11 font-bold shadow-sm"
              >
                <PenBox size={16} className="mr-2" /> Chỉnh sửa
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  handleDelete(selectedSessionInfo.id);
                }}
                className="w-full text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl h-11 font-bold bg-white"
              >
                <Trash2 size={16} className="mr-2" /> Xóa ca học
              </Button>
            </div>
          </div>
        )}

      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? "Xác nhận Xếp lịch mới" : "Chỉnh sửa Chi tiết Ca học"}
        footer={
          <div className="flex justify-end w-full">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6"
                onClick={handleSave}
                disabled={createSession.isPending || updateSession.isPending}
              >
                {(createSession.isPending || updateSession.isPending) && <Loader2 size={16} className="animate-spin" />}
                {modalMode === 'create' ? 'Lưu lịch học' : 'Lưu thay đổi'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="bg-slate-50 text-slate-700 p-4 rounded-xl text-sm mb-4 border border-slate-200 flex items-start gap-3">
            <Clock className="text-blue-500 mt-0.5" size={18} />
            <div>
              Ngày: <b className="text-slate-900">{new Date(sessionForm.sessionDate || new Date()).toLocaleDateString('vi-VN')}</b><br />
              Thời gian: <b className="text-blue-700">{sessionForm.startTime}</b> đến <b className="text-blue-700">{sessionForm.endTime}</b>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Lớp học <span className="text-red-500">*</span></label>
              <Select
                options={classes?.items?.map((c: any) => ({ value: c.id, label: c.name })) || []}
                placeholder="Chọn lớp học..."
                className="focus:border-blue-500 focus:ring-blue-500/20"
                value={sessionForm.classId}
                onChange={(val) => setSessionForm({ ...sessionForm, classId: val })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Giáo viên <span className="text-red-500">*</span></label>
              <Select
                options={teachers?.items?.map((t: any) => ({ value: t.id, label: t.fullName })) || []}
                placeholder="Chọn giáo viên..."
                className="focus:border-blue-500 focus:ring-blue-500/20"
                value={sessionForm.teacherId}
                onChange={(val) => setSessionForm({ ...sessionForm, teacherId: val })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Trợ giảng</label>
              <Select
                options={assistants?.items?.map((a: any) => ({ value: a.id, label: a.fullName })) || []}
                placeholder="Chọn trợ giảng..."
                className="focus:border-blue-500 focus:ring-blue-500/20"
                value={sessionForm.assistantId}
                onChange={(val) => setSessionForm({ ...sessionForm, assistantId: val })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ngày học <span className="text-red-500">*</span></label>
              <DatePicker
                selected={sessionForm.sessionDate ? new Date(sessionForm.sessionDate) : null}
                onChange={(date) => setSessionForm({ ...sessionForm, sessionDate: date ? date.toLocaleDateString('en-CA') : '' })}
                className="w-full h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Chủ đề (Nội dung bài)</label>
              <Input
                placeholder="VD: Grammar Unit 1..."
                className="focus:border-blue-500 focus:ring-blue-500/20 h-11"
                value={sessionForm.lessonTitle}
                onChange={(e) => setSessionForm({ ...sessionForm, lessonTitle: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Phòng học</label>
              <Input
                placeholder="VD: P.101..."
                className="focus:border-blue-500 focus:ring-blue-500/20 h-11"
                value={sessionForm.roomName}
                onChange={(e) => setSessionForm({ ...sessionForm, roomName: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Giờ bắt đầu</label>
              <DatePicker
                selected={sessionForm.startTime ? new Date(`2000-01-01T${sessionForm.startTime.length === 5 ? sessionForm.startTime + ':00' : sessionForm.startTime}`) : null}
                onChange={(date) => setSessionForm({ ...sessionForm, startTime: date ? date.toTimeString().split(' ')[0].substring(0, 5) : '' })}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Giờ"
                dateFormat="HH:mm"
                placeholderText="Chọn giờ..."
                className="w-full h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Giờ kết thúc</label>
              <DatePicker
                selected={sessionForm.endTime ? new Date(`2000-01-01T${sessionForm.endTime.length === 5 ? sessionForm.endTime + ':00' : sessionForm.endTime}`) : null}
                onChange={(date) => setSessionForm({ ...sessionForm, endTime: date ? date.toTimeString().split(' ')[0].substring(0, 5) : '' })}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Giờ"
                dateFormat="HH:mm"
                placeholderText="Chọn giờ..."
                className="w-full h-11"
              />
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
}
