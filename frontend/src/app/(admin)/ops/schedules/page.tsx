'use client';

import { useSessions, useCreateSession, useUpdateSession, useDeleteSession } from "@/hooks/queries/useSessions";
import { useClasses } from "@/hooks/queries/useClasses";
import { useUsers } from "@/hooks/queries/useUsers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { CreateButton } from '@/components/ui/create-button';
import { ActionButtons } from '@/components/ui/action-buttons';
import { useProfile } from '@/hooks/queries/useProfile';
import { EmptyState } from '@/components/ui/EmptyState';
import { useConfirm } from '@/providers/ConfirmProvider';

export default function SchedulesPage() {
  const { data: sessions, isLoading } = useSessions();
  const { data: classes } = useClasses();
  const { data: teachers } = useUsers('TEACHER');
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { confirm } = useConfirm();
  const [newSession, setNewSession] = useState({ classId: '', teacherId: '', lessonTitle: '', sessionDate: '', startTime: '', endTime: '' });

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const { data: profile } = useProfile();
  const isAuthorized = profile?.role === 'SUPER_ADMIN' || profile?.role === 'CENTER_ADMIN';

  const filteredSessions = sessions?.items?.filter(s => s.sessionDate.startsWith(selectedDate)) || [];

  const handleCreate = async () => {
    if (!newSession.classId || !newSession.teacherId || !newSession.sessionDate || !newSession.startTime || !newSession.endTime) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    try {
      await createSession.mutateAsync({
        ...newSession,
        startTime: newSession.startTime.length === 5 ? newSession.startTime + ':00' : newSession.startTime,
        endTime: newSession.endTime.length === 5 ? newSession.endTime + ':00' : newSession.endTime,
      });
      toast.success('Đã thêm buổi học mới');
      setIsCreateOpen(false);
      setNewSession({ classId: '', teacherId: '', lessonTitle: '', sessionDate: '', startTime: '', endTime: '' });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi thêm buổi học');
    }
  };

  const handleDeleteClick = (sessionId: string) => {
    confirm({
      title: "Xóa Buổi học",
      description: "Bạn có chắc chắn muốn xóa buổi học này không? Hành động này không thể hoàn tác.",
      requireInput: false,
      action: async () => {
        try {
          await deleteSession.mutateAsync(sessionId);
          toast.success('Đã xóa buổi học');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Lỗi khi xóa buổi học');
        }
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Lịch giảng dạy</h2>
          <p className="text-edu-muted text-sm">Theo dõi lịch dạy thực tế của giáo viên trong ngày</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted w-4 h-4" />
            <input 
              type="date" 
              className="pl-9 h-10 w-[160px] rounded-lg border border-edu-border focus:border-[#4CAF50] focus:ring-[#4CAF50]/30 text-sm bg-white"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          {isAuthorized && (
            <CreateButton onClick={() => setIsCreateOpen(true)} label="Xếp lịch học" />
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden p-6">
        <h3 className="font-semibold text-lg text-edu-fg mb-4">Ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</h3>
        
        {isLoading ? (
          <div className="text-center py-10 text-edu-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải lịch giảng dạy...</div>
        ) : filteredSessions.length === 0 ? (
          <EmptyState 
            description="Không có ca học nào được xếp lịch trong ngày này."
            hasFilter={today !== selectedDate}
            onClearFilter={() => setSelectedDate(today)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((s, i) => (
              <div key={s.id} className="flex gap-4 p-4 border border-edu-border rounded-xl bg-white hover:shadow-lg hover:-translate-y-1 hover:border-[#4CAF50]/50 transition-all duration-300 relative group overflow-hidden">
                  {s.statusCode === 'ONGOING' && (
                   <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#4CAF50] to-[#81C784] rounded-l-xl shadow-[0_0_8px_rgba(76,175,80,0.5)]"></div>
                 )}
                 {isAuthorized && (
                     <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <ActionButtons
                         onDelete={() => handleDeleteClick(s.id)}
                       />
                     </div>
                 )}
                 <div className="w-20 text-center border-r border-dashed border-edu-border pr-4 flex flex-col justify-center">
                   <div className="text-lg font-bold text-edu-fg">{s.startTime.substring(0, 5)}</div>
                   <div className="text-sm text-edu-muted">{s.endTime.substring(0, 5)}</div>
                 </div>
                 <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                     <h4 className="font-bold text-[#2E7D32] text-lg">Mã lớp: {s.classId?.substring(0, 8) ?? '---'}</h4>
                     <Badge variant={s.statusCode === 'COMPLETED' ? 'success' : s.statusCode === 'ONGOING' ? 'info' : 'muted'}>
                       {s.statusCode === 'COMPLETED' ? 'Đã xong' : s.statusCode === 'ONGOING' ? 'Đang diễn ra' : 'Sắp tới'}
                     </Badge>
                   </div>
                   <div className="text-sm text-edu-fgSecondary mb-1 truncate max-w-[200px]" title={s.lessonTitle}>
                     <span className="font-medium">Chủ đề:</span> {s.lessonTitle ?? 'Chưa cập nhật'}
                   </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        title="Xếp lịch buổi học"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
            <Button 
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white gap-2" 
              onClick={handleCreate}
              disabled={createSession.isPending}
            >
              {createSession.isPending && <Loader2 size={16} className="animate-spin" />}
              {createSession.isPending ? 'Đang lưu...' : 'Lưu lịch học'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Chọn lớp <span className="text-red-500">*</span></label>
              <Select 
                options={classes?.items?.map((c: any) => ({ value: c.id, label: c.name })) || []}
                placeholder="Chọn lớp học..."
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30"
                value={newSession.classId}
                onChange={(val) => setNewSession({...newSession, classId: val})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Giáo viên <span className="text-red-500">*</span></label>
              <Select 
                options={teachers?.items?.map((t: any) => ({ value: t.id, label: t.fullName })) || []}
                placeholder="Chọn giáo viên..."
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30"
                value={newSession.teacherId}
                onChange={(val) => setNewSession({...newSession, teacherId: val})}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Ngày học <span className="text-red-500">*</span></label>
              <Input 
                type="date"
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={newSession.sessionDate}
                onChange={(e) => setNewSession({...newSession, sessionDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Chủ đề bài học (tùy chọn)</label>
              <Input 
                placeholder="VD: Bài 1: Ngữ pháp"
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={newSession.lessonTitle}
                onChange={(e) => setNewSession({...newSession, lessonTitle: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Giờ bắt đầu</label>
              <Input 
                type="time"
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={newSession.startTime}
                onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Giờ kết thúc</label>
              <Input 
                type="time"
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={newSession.endTime}
                onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
              />
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
}
