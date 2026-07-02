import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitTeacherReport, useSubmitAssistantReport } from '@/hooks/queries/useReports';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle: string;
  userRole: string;
}

export function ReportModal({ isOpen, onClose, sessionId, sessionTitle, userRole }: ReportModalProps) {
  const submitTeacher = useSubmitTeacherReport(sessionId);
  const submitAssistant = useSubmitAssistantReport(sessionId);
  const isTeacher = userRole === 'TEACHER';

  const [teacherForm, setTeacherForm] = useState({
    lessonTaught: '',
    progress: '',
    teacherComment: '',
    specialStudents: ''
  });

  const [assistantForm, setAssistantForm] = useState({
    assistantNote: '',
    feedbackForTeacher: ''
  });

  const isPending = submitTeacher.isPending || submitAssistant.isPending;

  const handleSubmit = async () => {
    try {
      if (isTeacher) {
        if (!teacherForm.lessonTaught) {
          toast.error("Vui lòng nhập nội dung bài dạy");
          return;
        }
        await submitTeacher.mutateAsync(teacherForm);
      } else {
        if (!assistantForm.assistantNote) {
          toast.error("Vui lòng nhập ghi chú");
          return;
        }
        await submitAssistant.mutateAsync(assistantForm);
      }
      toast.success("Gửi báo cáo thành công!");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi báo cáo");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Báo cáo cuối buổi"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>Hủy</Button>
          <Button className="bg-edu-accent hover:bg-edu-accentDark text-white gap-2" onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-2 border border-blue-100">
          <span className="font-semibold">Ca học: </span>{sessionTitle}
        </div>

        {isTeacher ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nội dung bài dạy <span className="text-red-500">*</span></label>
              <Textarea 
                placeholder="Hôm nay đã dạy những nội dung gì..." 
                value={teacherForm.lessonTaught}
                onChange={e => setTeacherForm({...teacherForm, lessonTaught: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tiến độ bài học</label>
              <Input 
                placeholder="Ví dụ: Đạt 100% kế hoạch..." 
                value={teacherForm.progress}
                onChange={e => setTeacherForm({...teacherForm, progress: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nhận xét chung</label>
              <Textarea 
                placeholder="Nhận xét tình hình học tập chung của lớp..." 
                value={teacherForm.teacherComment}
                onChange={e => setTeacherForm({...teacherForm, teacherComment: e.target.value})}
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Học sinh cần lưu ý</label>
              <Textarea 
                placeholder="Ghi chú các học sinh cần kèm cặp thêm..." 
                value={teacherForm.specialStudents}
                onChange={e => setTeacherForm({...teacherForm, specialStudents: e.target.value})}
                rows={2}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ghi chú chuyên cần <span className="text-red-500">*</span></label>
              <Textarea 
                placeholder="Ghi chú về học sinh vắng, trễ..." 
                value={assistantForm.assistantNote}
                onChange={e => setAssistantForm({...assistantForm, assistantNote: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phản hồi về Giáo viên (Nội bộ)</label>
              <Textarea 
                placeholder="Nhận xét hoặc góp ý..." 
                value={assistantForm.feedbackForTeacher}
                onChange={e => setAssistantForm({...assistantForm, feedbackForTeacher: e.target.value})}
                rows={2}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
