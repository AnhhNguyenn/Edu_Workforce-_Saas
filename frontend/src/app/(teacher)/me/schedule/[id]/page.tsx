'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSessionDetail } from '@/hooks/queries/useSessions';
import { ArrowLeft, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { useProfile } from '@/hooks/queries/useProfile';
import { useCheckIn, useCheckOut, useMyAttendances, useSubmitStudentAttendances } from '@/hooks/queries/useAttendances';
import { useSessionReport, useSubmitTeacherReport, useSubmitAssistantReport } from '@/hooks/queries/useReports';
import { useStudents } from '@/hooks/queries/useStudents';
import { toast } from 'react-hot-toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/components/ui/stat-card';

export default function SessionWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: profile } = useProfile();
  const { data: session, isLoading: isSessionLoading } = useSessionDetail(id);
  const { data: attendances } = useMyAttendances();
  const { data: report } = useSessionReport(id);

  const [activeTab, setActiveTab] = useState<'CHECKIN' | 'ATTENDANCE' | 'REPORT'>('CHECKIN');

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const attendanceList = attendances?.items || (Array.isArray(attendances) ? attendances : []);
  const myAttendance = attendanceList.find((a: any) => a.sessionId === id);
  const isCheckedIn = !!myAttendance;
  const isCheckedOut = !!myAttendance?.checkOutTime;

  if (isSessionLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-edu-accent" size={32} /></div>;
  }

  if (!session) {
    return <EmptyState description="Không tìm thấy thông tin ca học." />;
  }

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ GPS");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        checkInMutation.mutate(
          { sessionId: id, latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          {
            onSuccess: () => {
              toast.success("Check-in thành công!");
              setActiveTab('ATTENDANCE'); // Auto move to next tab
            },
            onError: (err: any) => {
              toast.error(err.response?.data?.message || "Lỗi check-in");
            }
          }
        );
      },
      (err) => toast.error("Không thể lấy vị trí: " + err.message)
    );
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate(
      { sessionId: id, latitude: 0, longitude: 0 },
      {
        onSuccess: () => toast.success("Check-out thành công!"),
        onError: (err: any) => toast.error(err.response?.data?.message || "Lỗi check-out")
      }
    );
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-full border shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-bold text-edu-fg text-lg">{session.lessonTitle || 'Ca học không tên'}</h2>
          <div className="text-xs text-edu-muted flex gap-2">
            <span>{session.className}</span> • <span>{session.roomName}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {[
          { id: 'CHECKIN', label: 'Vào/Ra ca' },
          { id: 'ATTENDANCE', label: 'Điểm danh' },
          { id: 'REPORT', label: 'Báo cáo' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
              activeTab === tab.id ? "bg-white shadow text-edu-accent" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 min-h-[400px]">
        {activeTab === 'CHECKIN' && (
          <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
              <MapPin size={40} />
            </div>
            
            {!isCheckedIn ? (
              <>
                <h3 className="font-bold text-xl">Xác nhận vào ca học</h3>
                <p className="text-sm text-edu-muted">Vui lòng cấp quyền vị trí để hệ thống ghi nhận.</p>
                <button
                  onClick={handleCheckIn}
                  disabled={checkInMutation.isPending}
                  className="w-full max-w-xs py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-edu-accent to-[#7BC4FF] hover:shadow-lg active:scale-95 transition-all flex justify-center"
                >
                  {checkInMutation.isPending ? <Loader2 className="animate-spin" /> : 'CHECK-IN CA HỌC'}
                </button>
              </>
            ) : !isCheckedOut ? (
              <>
                <h3 className="font-bold text-xl text-edu-success">Đã Check-in thành công</h3>
                <p className="text-sm text-edu-muted">Bạn có thể chuyển sang bước Điểm danh và Báo cáo.</p>
                <button
                  onClick={handleCheckOut}
                  disabled={checkOutMutation.isPending}
                  className="w-full max-w-xs py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-[#FF8A65] to-[#FFB74D] hover:shadow-lg active:scale-95 transition-all flex justify-center mt-4"
                >
                  {checkOutMutation.isPending ? <Loader2 className="animate-spin" /> : 'CHECK-OUT KẾT THÚC'}
                </button>
              </>
            ) : (
              <>
                <div className="text-edu-success mb-2"><CheckCircle2 size={48} /></div>
                <h3 className="font-bold text-xl">Ca học đã hoàn thành</h3>
                <p className="text-sm text-edu-muted">Cảm ơn bạn đã hoàn thành tốt ca học.</p>
              </>
            )}
          </div>
        )}

        {activeTab === 'ATTENDANCE' && (
          <StudentAttendanceTab sessionId={id} classId={session.classId} isLocked={!isCheckedIn} />
        )}

        {activeTab === 'REPORT' && (
          <SessionReportTab sessionId={id} profile={profile} isLocked={!isCheckedIn} existingReport={report} />
        )}
      </div>
    </div>
  );
}

function StudentAttendanceTab({ sessionId, classId, isLocked }: { sessionId: string, classId: string, isLocked: boolean }) {
  const { data: studentsData, isLoading } = useStudents('', classId, '', '', 1, 100);
  const submitMutation = useSubmitStudentAttendances(sessionId);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  if (isLocked) return <div className="text-center py-10 text-edu-muted">Vui lòng Check-in trước khi điểm danh.</div>;
  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>;
  
  const students = studentsData?.items || [];
  if (students.length === 0) return <EmptyState description="Lớp này chưa có học viên nào." />;

  const handleToggle = (studentId: string, present: boolean) => {
    setAttendance(prev => ({ ...prev, [studentId]: present }));
  };

  const handleSubmit = () => {
    const records = students.map((s: any) => ({
      studentId: s.id,
      isPresent: attendance[s.id] !== false // Default present if not touched
    }));
    submitMutation.mutate({ records }, {
      onSuccess: () => toast.success("Đã lưu điểm danh học viên!")
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-sm">Danh sách ({students.length})</h3>
        <button className="text-xs text-edu-accent font-semibold bg-blue-50 px-3 py-1.5 rounded-md">Có mặt tất cả</button>
      </div>
      <div className="space-y-3">
        {students.map((s: any) => {
          const isPresent = attendance[s.id] !== false;
          return (
            <div key={s.id} className="flex items-center justify-between p-3 border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">{s.fullName[0]}</div>
                <div>
                  <div className="font-semibold text-sm">{s.fullName}</div>
                  <div className="text-[10px] text-gray-400">{s.studentCode}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleToggle(s.id, true)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", isPresent ? "bg-edu-success text-white" : "bg-gray-100 text-gray-500")}
                >
                  C.Mặt
                </button>
                <button 
                  onClick={() => handleToggle(s.id, false)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", !isPresent ? "bg-edu-warn text-white" : "bg-gray-100 text-gray-500")}
                >
                  Vắng
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button 
        onClick={handleSubmit}
        disabled={submitMutation.isPending}
        className="w-full py-3 mt-4 rounded-xl text-white font-bold bg-edu-accent hover:opacity-90 transition-all flex justify-center"
      >
        {submitMutation.isPending ? <Loader2 className="animate-spin" /> : 'LƯU ĐIỂM DANH'}
      </button>
    </div>
  );
}

function SessionReportTab({ sessionId, profile, isLocked, existingReport }: { sessionId: string, profile: any, isLocked: boolean, existingReport: any }) {
  const isTeacher = profile?.role === 'TEACHER';
  const teacherMutation = useSubmitTeacherReport(sessionId);
  const assistantMutation = useSubmitAssistantReport(sessionId);
  
  const [formData, setFormData] = useState({
    lessonTaught: existingReport?.reportDetail?.lessonTaught || '',
    progress: existingReport?.reportDetail?.progress || '',
    teacherComment: existingReport?.reportDetail?.teacherComment || '',
    assistantNote: existingReport?.reportDetail?.assistantNote || '',
    rating: 5,
    feedback: ''
  });

  if (isLocked) return <div className="text-center py-10 text-edu-muted">Vui lòng Check-in trước khi viết báo cáo.</div>;

  const handleSubmit = () => {
    if (isTeacher) {
      teacherMutation.mutate({
        lessonTaught: formData.lessonTaught,
        progress: formData.progress,
        teacherComment: formData.teacherComment,
        ratingForAssistant: formData.rating,
        feedbackForAssistant: formData.feedback
      }, {
        onSuccess: () => toast.success("Đã gửi báo cáo Giáo viên!")
      });
    } else {
      assistantMutation.mutate({
        assistantNote: formData.assistantNote,
        ratingForTeacher: formData.rating,
        feedbackForTeacher: formData.feedback
      }, {
        onSuccess: () => toast.success("Đã gửi báo cáo Trợ giảng!")
      });
    }
  };

  const isPending = teacherMutation.isPending || assistantMutation.isPending;

  return (
    <div className="space-y-4">
      {isTeacher ? (
        <>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Nội dung bài dạy</label>
            <textarea className="w-full border rounded-lg p-2 text-sm" rows={2} value={formData.lessonTaught} onChange={e => setFormData({...formData, lessonTaught: e.target.value})} placeholder="Nay dạy gì..."></textarea>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Nhận xét chung</label>
            <textarea className="w-full border rounded-lg p-2 text-sm" rows={2} value={formData.teacherComment} onChange={e => setFormData({...formData, teacherComment: e.target.value})} placeholder="Lớp học ngoan..."></textarea>
          </div>
        </>
      ) : (
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">Ghi chú của Trợ giảng</label>
          <textarea className="w-full border rounded-lg p-2 text-sm" rows={3} value={formData.assistantNote} onChange={e => setFormData({...formData, assistantNote: e.target.value})} placeholder="Ghi chú về lớp học..."></textarea>
        </div>
      )}
      
      <div className="pt-4 border-t">
        <h4 className="font-bold text-sm mb-2">Đánh giá {isTeacher ? 'Trợ giảng' : 'Giáo viên'}</h4>
        <div className="flex gap-2 mb-2">
          {[1,2,3,4,5].map(star => (
            <button key={star} onClick={() => setFormData({...formData, rating: star})} className={cn("w-8 h-8 rounded-full font-bold", formData.rating >= star ? "bg-yellow-400 text-white" : "bg-gray-100")}>{star}</button>
          ))}
        </div>
        <textarea className="w-full border rounded-lg p-2 text-sm" rows={2} value={formData.feedback} onChange={e => setFormData({...formData, feedback: e.target.value})} placeholder="Góp ý chéo..."></textarea>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full py-3 mt-2 rounded-xl text-white font-bold bg-gray-800 hover:bg-black transition-all flex justify-center"
      >
        {isPending ? <Loader2 className="animate-spin" /> : 'GỬI BÁO CÁO'}
      </button>
    </div>
  );
}
