'use client';

import { useSessions, useCreateSession, useUpdateSession, useDeleteSession } from "@/hooks/queries/useSessions";
import { useClasses } from "@/hooks/queries/useClasses";
import { useUsers } from "@/hooks/queries/useUsers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Users, GraduationCap, GripVertical, CalendarPlus, Clock, PenBox } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { useProfile } from '@/hooks/queries/useProfile';
import { useConfirm } from '@/providers/ConfirmProvider';

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import viLocale from '@fullcalendar/core/locales/vi';

export default function SchedulesPage() {
  const { data: sessions, isLoading } = useSessions();
  const { data: classes } = useClasses();
  const { data: teachers } = useUsers('TEACHER');
  const { data: assistants } = useUsers('ASSISTANT');
  
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeTab, setActiveTab] = useState<'classes' | 'teachers' | 'assistants'>('classes');
  
  const { confirm } = useConfirm();
  
  const [editingSessionId, setEditingSessionId] = useState<string>('');
  const [sessionForm, setSessionForm] = useState({ 
    classId: '', 
    teacherId: '', 
    assistantId: '',
    lessonTitle: '', 
    sessionDate: '', 
    startTime: '', 
    endTime: '' 
  });

  const { data: profile } = useProfile();
  const isAuthorized = profile?.role === 'SUPER_ADMIN' || profile?.role === 'CENTER_ADMIN';

  // Format events for FullCalendar
  const calendarEvents = sessions?.items?.map(s => {
    const className = classes?.items?.find((c: any) => c.id === s.classId)?.name || s.classId?.substring(0, 8);
    const teacherName = teachers?.items?.find((t: any) => t.id === s.teacherId)?.fullName || 'Chưa PC GV';
    const assistantName = assistants?.items?.find((a: any) => a.id === s.assistantId)?.fullName || 'Chưa PC TG';
    const datePart = new Date(s.sessionDate).toLocaleDateString('en-CA');
    
    return {
      id: s.id,
      title: `${className}`,
      start: `${datePart}T${s.startTime}`,
      end: `${datePart}T${s.endTime}`,
      backgroundColor: s.statusCode === 'COMPLETED' ? '#10B981' : s.statusCode === 'ONGOING' ? '#F59E0B' : '#3B82F6',
      borderColor: 'transparent',
      textColor: '#ffffff',
      extendedProps: { ...s, teacherName, assistantName }
    };
  }) || [];

  // Initialize Draggable items ONLY for Classes
  useEffect(() => {
    const containerEl = document.getElementById('external-events');
    let draggable: Draggable | null = null;
    
    if (containerEl && classes?.items) {
      draggable = new Draggable(containerEl, {
        itemSelector: '.fc-class-event',
        eventData: function(eventEl) {
          return {
            title: eventEl.getAttribute('data-title'),
            duration: '02:00'
          };
        }
      });
    }
    
    return () => {
      if (draggable) draggable.destroy();
    };
  }, [classes?.items, activeTab]);

  // Kéo Lớp thả vào ô trống -> Tạo ngay lập tức (Không mở Modal)
  const handleExternalDrop = async (info: any) => {
    const type = info.draggedEl.getAttribute('data-type');
    const id = info.draggedEl.getAttribute('data-id');
    const dropDate = info.date;
    
    const sessionDate = dropDate.toLocaleDateString('en-CA');
    const startTime = dropDate.toTimeString().split(' ')[0].substring(0, 5) + ':00';
    const endDate = new Date(dropDate.getTime() + 2 * 60 * 60 * 1000);
    const endTime = endDate.toTimeString().split(' ')[0].substring(0, 5) + ':00';

    if (type === 'class') {
      try {
        await createSession.mutateAsync({
          classId: id,
          teacherId: null,
          assistantId: null,
          sessionDate,
          startTime,
          endTime
        });
        toast.success('Đã xếp lịch cho lớp học!');
      } catch (e: any) {
        toast.error('Lỗi khi xếp lịch: ' + (e.response?.data?.message || ''));
      }
    }
  };

  const handleEventReceive = (info: any) => {
    // Xóa ngay event tạm do FullCalendar tạo ra để chỉ sử dụng dữ liệu thật từ DB (React Query)
    info.event.remove();
  };

  // Chọn vùng thời gian trống
  const handleTimeSelect = (info: any) => {
    const startDate = info.start;
    const endDate = info.end;
    
    setSessionForm({
      classId: '',
      teacherId: '',
      assistantId: '',
      lessonTitle: '',
      sessionDate: startDate.toLocaleDateString('en-CA'),
      startTime: startDate.toTimeString().split(' ')[0].substring(0, 5),
      endTime: endDate.toTimeString().split(' ')[0].substring(0, 5)
    });
    
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Nhấp vào buổi học đã có -> Mở form Sửa
  const handleEventClick = (info: any) => {
    if (!isAuthorized) return;
    
    const session = info.event.extendedProps;
    const start = info.event.start;
    const end = info.event.end || new Date(start.getTime() + 2 * 60 * 60 * 1000);

    setEditingSessionId(info.event.id);
    setSessionForm({
      classId: session.classId || '',
      teacherId: session.teacherId || '',
      assistantId: session.assistantId || '',
      lessonTitle: session.lessonTitle || '',
      sessionDate: start.toLocaleDateString('en-CA'),
      startTime: start.toTimeString().split(' ')[0].substring(0, 5),
      endTime: end.toTimeString().split(' ')[0].substring(0, 5)
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Kéo mép để giãn thời gian (Resize)
  const handleEventResize = async (info: any) => {
    if (!isAuthorized) { info.revert(); return; }
    
    const session = info.event.extendedProps;
    const newStart = info.event.start;
    const newEnd = info.event.end;
    
    try {
      const updateData = {
        classId: session.classId,
        teacherId: session.teacherId,
        assistantId: session.assistantId,
        lessonTitle: session.lessonTitle,
        sessionDate: newStart.toLocaleDateString('en-CA'),
        startTime: newStart.toTimeString().split(' ')[0].substring(0, 5) + ':00',
        endTime: newEnd.toTimeString().split(' ')[0].substring(0, 5) + ':00'
      };
      await updateSession.mutateAsync({ id: info.event.id, data: updateData });
      toast.success('Đã cập nhật giờ học!');
    } catch (e: any) {
      info.revert();
      toast.error('Lỗi cập nhật giờ: ' + (e.response?.data?.message || ''));
    }
  };

  // Nắm nguyên khối ném sang ô khác (Drop / Move)
  const handleEventDrop = async (info: any) => {
    if (!isAuthorized) { info.revert(); return; }
    
    const session = info.event.extendedProps;
    const newStart = info.event.start;
    const newEnd = info.event.end;
    
    try {
      const updateData = {
        classId: session.classId,
        teacherId: session.teacherId,
        assistantId: session.assistantId,
        lessonTitle: session.lessonTitle,
        sessionDate: newStart.toLocaleDateString('en-CA'),
        startTime: newStart.toTimeString().split(' ')[0].substring(0, 5) + ':00',
        endTime: newEnd ? newEnd.toTimeString().split(' ')[0].substring(0, 5) + ':00' : session.endTime
      };
      await updateSession.mutateAsync({ id: info.event.id, data: updateData });
      toast.success('Đã chuyển lịch học!');
    } catch (e: any) {
      info.revert();
      toast.error('Lỗi chuyển lịch: ' + (e.response?.data?.message || ''));
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
      }
      setIsModalOpen(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi lưu lịch học');
    }
  };

  // Ném Giáo viên / Trợ giảng ĐÈ lên một Event có sẵn trên Lịch (Native HTML5 Drag and Drop)
  const handleDropOnEvent = async (e: any, session: any, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthorized) return;

    const dragType = e.dataTransfer.getData('type');
    const dragId = e.dataTransfer.getData('id');

    if (!dragType || !dragId) return;

    try {
      const updateData = {
        classId: session.classId,
        teacherId: dragType === 'teacher' ? dragId : session.teacherId,
        assistantId: dragType === 'assistant' ? dragId : session.assistantId,
        lessonTitle: session.lessonTitle,
        sessionDate: session.sessionDate,
        startTime: session.startTime,
        endTime: session.endTime
      };
      
      await updateSession.mutateAsync({ id: eventId, data: updateData });
      toast.success(`Đã phân công ${dragType === 'teacher' ? 'Giáo viên' : 'Trợ giảng'}!`);
    } catch (err: any) {
      toast.error('Lỗi khi phân công: ' + (err.response?.data?.message || ''));
    }
  };

  const handleDelete = () => {
    confirm({
      title: "Xóa Lịch học",
      description: "Bạn có chắc chắn muốn xóa buổi học này không?",
      requireInput: false,
      action: async () => {
        try {
          await deleteSession.mutateAsync(editingSessionId);
          toast.success('Đã xóa buổi học');
          setIsModalOpen(false);
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Lỗi khi xóa buổi học');
        }
      }
    });
  };

  // Custom Event Render for better UI & HTML5 Drop Zone
  const renderEventContent = (eventInfo: any) => {
    const session = eventInfo.event.extendedProps;
    const tName = session.teacherName && session.teacherName !== 'Chưa PC GV' ? session.teacherName : 'Chưa phân công';
    const aName = session.assistantName && session.assistantName !== 'Chưa PC TG' ? session.assistantName : '';
    
    return (
      <div 
        className="w-full h-full flex flex-col justify-between p-1 overflow-hidden relative group"
        onDragOver={(e) => {
          e.preventDefault(); 
          e.stopPropagation();
          e.currentTarget.classList.add('bg-white/30', 'scale-105');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('bg-white/30', 'scale-105');
        }}
        onDrop={(e) => {
          e.currentTarget.classList.remove('bg-white/30', 'scale-105');
          handleDropOnEvent(e, session, eventInfo.event.id);
        }}
      >
        <div>
          <div className="font-bold text-[13px] tracking-tight leading-tight truncate drop-shadow-md">
            {eventInfo.event.title}
          </div>
          {session.lessonTitle && (
            <div className="text-[11px] text-blue-100 font-semibold truncate mt-0.5 drop-shadow-sm">
              📚 {session.lessonTitle}
            </div>
          )}
          <div className="text-[11px] opacity-95 flex items-center gap-1 mt-1 font-medium truncate bg-black/10 w-fit px-1 rounded">
            <Users size={10} /> 
            <span>{tName} {aName ? `(+ ${aName})` : ''}</span>
          </div>
        </div>
        <div className="text-[10px] opacity-90 flex items-center gap-1 font-bold">
          <Clock size={10} /> {eventInfo.timeText}
        </div>
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 p-1 rounded backdrop-blur-sm">
          <PenBox size={12} className="text-white" />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-7 pb-10">
      <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-extrabold mb-2 text-edu-fg bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
            Lịch giảng dạy
          </h2>
          <p className="text-edu-muted text-sm font-medium">Kéo Lớp hoặc Giáo viên thả vào lưới. Kéo giãn cạnh dưới để đổi giờ. Nhấp vào lịch để Sửa/Xóa.</p>
        </div>
        <Button 
          onClick={() => {
            setSessionForm({ classId: '', teacherId: '', assistantId: '', lessonTitle: '', sessionDate: '', startTime: '', endTime: '' });
            setModalMode('create');
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 shadow-md gap-2 rounded-xl"
        >
          <CalendarPlus size={18} /> Xếp lịch thủ công
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* SIDEBAR: Draggable Resources */}
        <div className="w-full lg:w-72 flex-shrink-0 z-10">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden lg:sticky lg:top-6" id="external-events">
            
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setActiveTab('classes')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex justify-center items-center gap-1 ${activeTab === 'classes' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                Lớp học
              </button>
              <button 
                onClick={() => setActiveTab('teachers')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex justify-center items-center gap-1 ${activeTab === 'teachers' ? 'border-purple-500 text-purple-600 bg-purple-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                Giáo viên
              </button>
              <button 
                onClick={() => setActiveTab('assistants')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex justify-center items-center gap-1 ${activeTab === 'assistants' ? 'border-teal-500 text-teal-600 bg-teal-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                Trợ giảng
              </button>
            </div>

            <div className="p-4">
              <p className="text-xs text-slate-500 mb-4 text-center bg-slate-50 py-2 rounded-lg font-medium border border-slate-100">
                Nắm và kéo mục dưới đây thả vào lịch
              </p>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === 'classes' && classes?.items?.map((c: any) => (
                  <div 
                    key={c.id} 
                    className="fc-class-event flex items-center p-3 bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 hover:border-blue-300 rounded-xl cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow-md group"
                    data-type="class"
                    data-id={c.id}
                    data-title={c.name}
                  >
                    <GripVertical size={16} className="text-slate-300 mr-2 group-hover:text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-slate-800 truncate">{c.name}</div>
                    </div>
                  </div>
                ))}

                {activeTab === 'teachers' && teachers?.items?.map((t: any) => (
                  <div 
                    key={t.id} 
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('type', 'teacher');
                      e.dataTransfer.setData('id', t.id);
                    }}
                    className="flex items-center p-3 bg-white hover:bg-purple-50 text-slate-700 border border-slate-200 hover:border-purple-300 rounded-xl cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow-md group"
                  >
                    <GripVertical size={16} className="text-slate-300 mr-2 group-hover:text-purple-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-slate-800 truncate">{t.fullName}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{t.email}</div>
                    </div>
                  </div>
                ))}

                {activeTab === 'assistants' && assistants?.items?.map((a: any) => (
                  <div 
                    key={a.id} 
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('type', 'assistant');
                      e.dataTransfer.setData('id', a.id);
                    }}
                    className="flex items-center p-3 bg-white hover:bg-teal-50 text-slate-700 border border-slate-200 hover:border-teal-300 rounded-xl cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow-md group"
                  >
                    <GripVertical size={16} className="text-slate-300 mr-2 group-hover:text-teal-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-slate-800 truncate">{a.fullName}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{a.email}</div>
                    </div>
                  </div>
                ))}
                
                {((activeTab === 'classes' && classes?.items?.length === 0) || 
                  (activeTab === 'teachers' && teachers?.items?.length === 0) ||
                  (activeTab === 'assistants' && assistants?.items?.length === 0)) && (
                  <div className="text-center py-8 text-sm text-slate-400">Danh sách trống</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CALENDAR */}
        <div className="flex-1 w-full bg-white p-2 sm:p-5 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 min-w-0">
          <style dangerouslySetInnerHTML={{__html: `
            .fc-theme-standard td, .fc-theme-standard th { border-color: #F1F5F9; }
            .fc-col-header-cell { padding: 12px 0; background: #F8FAFC; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 13px; border-bottom: 2px solid #E2E8F0 !important; }
            .fc-timegrid-slot { height: 44px; }
            .fc-timegrid-slot-label { font-size: 12px; font-weight: 600; color: #64748B; }
            .fc-event { border-radius: 8px !important; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1) !important; border: none !important; transition: transform 0.1s, box-shadow 0.1s; cursor: pointer; }
            .fc-event:hover { transform: scale(1.02); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1) !important; z-index: 50 !important; }
            .fc-toolbar-title { font-size: 1.5rem !important; font-weight: 800; color: #0F172A; }
            .fc-button-primary { background-color: #fff !important; color: #475569 !important; border: 1px solid #E2E8F0 !important; text-transform: capitalize; font-weight: 600 !important; border-radius: 8px !important; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05) !important; transition: all 0.2s; }
            .fc-button-primary:not(:disabled):hover { background-color: #F8FAFC !important; color: #0F172A !important; border-color: #CBD5E1 !important; }
            .fc-button-active { background-color: #EFF6FF !important; color: #2563EB !important; border-color: #BFDBFE !important; }
            .fc-today-button { background-color: #F1F5F9 !important; }
            .fc-timegrid-now-indicator-line { border-color: #EF4444; border-width: 2px; }
            .fc-timegrid-now-indicator-arrow { border-color: #EF4444; border-width: 6px; margin-top: -5px; }
            .fc-highlight { background: rgba(59, 130, 246, 0.15); }
            .fc-timegrid-col.fc-day-today { background-color: rgba(248, 250, 252, 0.5) !important; }
            @media (max-width: 768px) {
              .fc-header-toolbar { flex-direction: column; gap: 12px; }
              .fc-toolbar-title { font-size: 1.25rem !important; }
              .fc-toolbar-chunk { display: flex; justify-content: center; flex-wrap: wrap; gap: 4px; }
              .fc .fc-button { padding: 4px 8px !important; font-size: 0.8rem !important; }
            }
          `}} />
          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-blue-500 mb-4 h-10 w-10" /> <span className="text-slate-500 font-medium">Đang tải lịch điều phối...</span></div>
          ) : (
            <FullCalendar
              plugins={[ timeGridPlugin, interactionPlugin, dayGridPlugin ]}
              initialView="timeGridWeek"
              locale={viLocale}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              editable={isAuthorized} // Cho phép kéo giãn (resize) và ném (move)
              droppable={isAuthorized} // Cho phép nhận event từ bên ngoài
              selectable={isAuthorized} // Cho phép bôi đen chọn vùng
              selectMirror={true}
              nowIndicator={true}
              height={800}
              events={calendarEvents}
              eventReceive={handleEventReceive}
              drop={handleExternalDrop}
              select={handleTimeSelect}
              eventClick={handleEventClick}
              eventResize={handleEventResize}
              eventDrop={handleEventDrop}
              eventContent={renderEventContent}
              snapDuration="00:15:00" // Snap theo 15 phút
            />
          )}
        </div>
      </div>

      {/* MODAL THÊM / SỬA LỊCH */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalMode === 'create' ? "Xác nhận Xếp lịch mới" : "Chỉnh sửa Chi tiết Ca học"}
        footer={
          <div className="flex justify-between w-full">
            {modalMode === 'edit' && isAuthorized ? (
              <Button variant="danger" onClick={handleDelete} className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none">
                Xóa lịch học
              </Button>
            ) : <div></div>}
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
              Ngày: <b className="text-slate-900">{new Date(sessionForm.sessionDate || new Date()).toLocaleDateString('vi-VN')}</b><br/>
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
                onChange={(val) => setSessionForm({...sessionForm, classId: val})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Giáo viên <span className="text-red-500">*</span></label>
              <Select 
                options={teachers?.items?.map((t: any) => ({ value: t.id, label: t.fullName })) || []}
                placeholder="Chọn giáo viên..."
                className="focus:border-blue-500 focus:ring-blue-500/20"
                value={sessionForm.teacherId}
                onChange={(val) => setSessionForm({...sessionForm, teacherId: val})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Trợ giảng</label>
              <Select 
                options={assistants?.items?.map((a: any) => ({ value: a.id, label: a.fullName })) || []}
                placeholder="Chọn trợ giảng..."
                className="focus:border-blue-500 focus:ring-blue-500/20"
                value={sessionForm.assistantId}
                onChange={(val) => setSessionForm({...sessionForm, assistantId: val})}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ngày học <span className="text-red-500">*</span></label>
              <DatePicker 
                selected={sessionForm.sessionDate ? new Date(sessionForm.sessionDate) : null}
                onChange={(date) => setSessionForm({...sessionForm, sessionDate: date ? date.toLocaleDateString('en-CA') : ''})}
                className="w-full h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Chủ đề (Nội dung bài)</label>
              <Input 
                placeholder="VD: Grammar Unit 1..."
                className="focus:border-blue-500 focus:ring-blue-500/20 h-11" 
                value={sessionForm.lessonTitle}
                onChange={(e) => setSessionForm({...sessionForm, lessonTitle: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Giờ bắt đầu</label>
              <DatePicker 
                selected={sessionForm.startTime ? new Date(`2000-01-01T${sessionForm.startTime.length === 5 ? sessionForm.startTime + ':00' : sessionForm.startTime}`) : null}
                onChange={(date) => setSessionForm({...sessionForm, startTime: date ? date.toTimeString().split(' ')[0].substring(0, 5) : ''})}
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
                onChange={(date) => setSessionForm({...sessionForm, endTime: date ? date.toTimeString().split(' ')[0].substring(0, 5) : ''})}
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
