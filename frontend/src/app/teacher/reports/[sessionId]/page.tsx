'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useSubmitTeacherReport, useSubmitAssistantReport, useSessionReport } from '@/hooks/queries/useReports';
import { useProfile } from '@/hooks/queries/useProfile';
import { ChevronLeft, Loader2, Save, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReportSubmitPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { data: profile } = useProfile();
  
  // Check if report already exists
  const { data: existingReport, isLoading: isReportLoading } = useSessionReport(sessionId);

  const teacherMutation = useSubmitTeacherReport(sessionId);
  const assistantMutation = useSubmitAssistantReport(sessionId);

  const isTeacher = profile?.role === 'TEACHER';

  // Teacher Form State
  const [lessonTaught, setLessonTaught] = useState('');
  const [progress, setProgress] = useState('Đúng tiến độ');
  const [teacherComment, setTeacherComment] = useState('');
  const [specialStudents, setSpecialStudents] = useState('');
  const [ratingForAssistant, setRatingForAssistant] = useState(5);
  const [feedbackForAssistant, setFeedbackForAssistant] = useState('');

  // Assistant Form State
  const [assistantNote, setAssistantNote] = useState('');
  const [ratingForTeacher, setRatingForTeacher] = useState(5);
  const [feedbackForTeacher, setFeedbackForTeacher] = useState('');

  const handleSubmit = () => {
    if (isTeacher) {
      teacherMutation.mutate({
        lessonTaught,
        progress,
        teacherComment,
        specialStudents,
        ratingForAssistant,
        feedbackForAssistant
      }, {
        onSuccess: () => {
          toast.success("Đã nộp báo cáo thành công!");
          router.back();
        },
        onError: (e: any) => toast.error(e.response?.data?.message || "Lỗi nộp báo cáo")
      });
    } else {
      assistantMutation.mutate({
        assistantNote,
        ratingForTeacher,
        feedbackForTeacher
      }, {
        onSuccess: () => {
          toast.success("Đã nộp báo cáo thành công!");
          router.back();
        },
        onError: (e: any) => toast.error(e.response?.data?.message || "Lỗi nộp báo cáo")
      });
    }
  };

  if (isReportLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-edu-accent" size={32} /></div>;

  if (existingReport) {
    return (
      <div className="space-y-4 pt-4 pb-20">
        <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-edu-border">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-edu-success leading-tight">Báo cáo đã nộp</h2>
            <p className="text-xs text-edu-muted">Ca học đã được báo cáo thành công.</p>
          </div>
        </div>
      </div>
    );
  }

  const isPending = teacherMutation.isPending || assistantMutation.isPending;

  return (
    <div className="space-y-4 pb-20 -mt-2">
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-edu-border">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-edu-fg leading-tight">Nộp báo cáo ca dạy</h2>
          <p className="text-xs text-edu-muted">Vai trò: {isTeacher ? 'Giáo viên' : 'Trợ giảng'}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-edu-border shadow-sm space-y-4">
        {isTeacher ? (
          <>
            <div>
              <label className="block text-xs font-bold text-edu-muted uppercase mb-1">Nội dung bài giảng</label>
              <input value={lessonTaught} onChange={e => setLessonTaught(e.target.value)} className="w-full border border-edu-border rounded-lg p-2 text-sm" placeholder="VD: Unit 5 Lesson 1..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-edu-muted uppercase mb-1">Tiến độ</label>
              <select value={progress} onChange={e => setProgress(e.target.value)} className="w-full border border-edu-border rounded-lg p-2 text-sm bg-white">
                <option>Đúng tiến độ</option>
                <option>Chậm tiến độ</option>
                <option>Vượt tiến độ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-edu-muted uppercase mb-1">Nhận xét lớp học</label>
              <textarea value={teacherComment} onChange={e => setTeacherComment(e.target.value)} className="w-full border border-edu-border rounded-lg p-2 text-sm" rows={3} placeholder="Đánh giá chung về lớp..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-edu-muted uppercase mb-1">Học sinh đặc biệt</label>
              <input value={specialStudents} onChange={e => setSpecialStudents(e.target.value)} className="w-full border border-edu-border rounded-lg p-2 text-sm" placeholder="Nhắc nhở học sinh cụ thể..." />
            </div>
            
            <hr className="my-2 border-edu-border" />
            <h4 className="font-bold text-sm text-edu-fg">Đánh giá Trợ giảng</h4>
            
            <div>
              <label className="block text-xs font-bold text-edu-muted uppercase mb-1">Chấm điểm trợ giảng (1-5)</label>
              <input type="number" min="1" max="5" value={ratingForAssistant} onChange={e => setRatingForAssistant(Number(e.target.value))} className="w-full border border-edu-border rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-edu-muted uppercase mb-1">Góp ý cho trợ giảng</label>
              <input value={feedbackForAssistant} onChange={e => setFeedbackForAssistant(e.target.value)} className="w-full border border-edu-border rounded-lg p-2 text-sm" placeholder="Phản hồi..." />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-bold text-edu-muted uppercase mb-1">Ghi chú của Trợ giảng</label>
              <textarea value={assistantNote} onChange={e => setAssistantNote(e.target.value)} className="w-full border border-edu-border rounded-lg p-2 text-sm" rows={3} placeholder="Tình hình lớp, học sinh..." />
            </div>

            <hr className="my-2 border-edu-border" />
            <h4 className="font-bold text-sm text-edu-fg">Đánh giá Giáo viên</h4>
            
            <div>
              <label className="block text-xs font-bold text-edu-muted uppercase mb-1">Chấm điểm giáo viên (1-5)</label>
              <input type="number" min="1" max="5" value={ratingForTeacher} onChange={e => setRatingForTeacher(Number(e.target.value))} className="w-full border border-edu-border rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-edu-muted uppercase mb-1">Góp ý cho giáo viên</label>
              <input value={feedbackForTeacher} onChange={e => setFeedbackForTeacher(e.target.value)} className="w-full border border-edu-border rounded-lg p-2 text-sm" placeholder="Phản hồi..." />
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-[80px] left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <div className="w-full sm:w-[390px] mx-auto pointer-events-auto">
          <button 
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-4 rounded-xl text-white font-bold text-base bg-gradient-to-r from-edu-accent to-[#7BC4FF] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            NỘP BÁO CÁO
          </button>
        </div>
      </div>
    </div>
  );
}
