'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSessionDetail } from '@/hooks/queries/useSessions';
import { useClasses } from '@/hooks/queries/useClasses';
import { useSchools } from '@/hooks/queries/useSchools';
import { ArrowLeft, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { useProfile } from '@/hooks/queries/useProfile';
import { useCheckIn, useCheckOut, useMyAttendances, useSubmitStudentAttendances } from '@/hooks/queries/useAttendances';
import { useSessionReport, useSubmitTeacherReport, useSubmitAssistantReport } from '@/hooks/queries/useReports';
import { useStudents } from '@/hooks/queries/useStudents';
import { toast } from 'react-hot-toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/components/ui/stat-card';
import { AttendanceActionModal } from '@/components/schedule/AttendanceActionModal';

export default function SessionWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: profile } = useProfile();
  const { data: session, isLoading: isSessionLoading } = useSessionDetail(id);
  const { data: attendances } = useMyAttendances();
  const { data: report } = useSessionReport(id);
  
  const { data: classesData } = useClasses('', undefined, undefined, 1, 1000);
  const { data: schoolsData } = useSchools();

  const cls = classesData?.items?.find(c => c.id === session?.classId);
  const school = schoolsData?.items?.find(sch => sch.id === (cls as any)?.schoolId);

  const [activeTab, setActiveTab] = useState<'CHECKIN' | 'ATTENDANCE' | 'REPORT'>('CHECKIN');

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const attendanceList = attendances?.items || (Array.isArray(attendances) ? attendances : []);
  const myAttendance = attendanceList.find((a: any) => a.sessionId === id);
  const isCheckedIn = !!myAttendance;
  const isCheckedOut = !!myAttendance?.checkoutTime;

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'checkin' | 'checkout'>('checkin');
  const [isOutOfRange, setIsOutOfRange] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      // Warm up GPS as soon as teacher opens the schedule details page
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {},
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  if (isSessionLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-edu-accent" size={32} /></div>;
  }

  if (!session) {
    return <EmptyState description="Không tìm thấy thông tin ca học." />;
  }

  const handleModalSubmit = async (photoBase64: string | null, reason: string | null) => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ GPS");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const payload = {
          sessionId: id,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          note: reason || undefined,
          photoBase64: photoBase64 || undefined
        };

        if (actionType === 'checkin') {
          checkInMutation.mutate(payload, {
            onSuccess: () => {
              toast.success("Check-in thành công!");
              setActionModalOpen(false);
              setIsOutOfRange(false);
              setActiveTab('ATTENDANCE'); // Auto move to next tab
            },
            onError: (err: any) => {
              const msg = err.response?.data?.Message || err.response?.data?.message;
              if (msg === "OUT_OF_RANGE") {
                setIsOutOfRange(true);
                toast.error("Bạn đang ngoài cơ sở. Vui lòng ghi rõ lý do giải trình.");
              } else {
                toast.error(msg || "Lỗi check-in");
              }
            }
          });
        } else {
          checkOutMutation.mutate(payload, {
            onSuccess: () => {
              toast.success("Check-out thành công!");
              setActionModalOpen(false);
              setIsOutOfRange(false);
            },
            onError: (err: any) => {
              const msg = err.response?.data?.Message || err.response?.data?.message;
              if (msg === "OUT_OF_RANGE") {
                setIsOutOfRange(true);
                toast.error("Bạn đang ngoài cơ sở. Vui lòng ghi rõ lý do giải trình.");
              } else {
                toast.error(msg || "Lỗi check-out");
              }
            }
          });
        }
      },
      (err) => toast.error("Không thể lấy vị trí GPS: " + err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCheckIn = () => {
    setActionType('checkin');
    setIsOutOfRange(false);
    setActionModalOpen(true);
  };

  const handleCheckOut = () => {
    setActionType('checkout');
    setIsOutOfRange(false);
    setActionModalOpen(true);
  };

  const now = new Date();
  const [eHours, eMinutes] = (session.endTime || '00:00').split(':').map(Number);
  const sessionEndTime = new Date(session.sessionDate);
  sessionEndTime.setHours(eHours, eMinutes, 0, 0);

  const endOfDay = new Date(session.sessionDate);
  endOfDay.setHours(23, 59, 59, 999);

  const isPastEndTime = now > sessionEndTime;
  const isPastEndOfDay = now > endOfDay;

  const [sHours, sMinutes] = (session.startTime || '00:00').split(':').map(Number);
  const sessionStartTime = new Date(session.sessionDate);
  sessionStartTime.setHours(sHours, sMinutes, 0, 0);

  const isCheckinLocked = !isCheckedIn && isPastEndTime;
  const isTooEarlyToCheckin = !isCheckedIn && now < new Date(sessionStartTime.getTime() - 5 * 60 * 1000);
  const allowedCheckinTime = new Date(sessionStartTime.getTime() - 5 * 60 * 1000);
  const allowedTimeStr = allowedCheckinTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const isCheckoutLocked = isCheckedIn && !isCheckedOut && isPastEndOfDay;

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
              isCheckinLocked ? (
                <>
                  <h3 className="font-bold text-xl text-edu-warn">Vắng mặt / Đã qua</h3>
                  <p className="text-sm text-edu-muted">Ca học đã kết thúc và bạn chưa Check-in. Hệ thống đã khóa ca này.</p>
                </>
              ) : isTooEarlyToCheckin ? (
                <>
                  <h3 className="font-bold text-xl text-slate-500">Chưa đến giờ Check-in</h3>
                  <p className="text-sm text-edu-muted px-4">Bạn chỉ có thể thực hiện Check-in trước giờ học tối đa 5 phút (từ lúc {allowedTimeStr}).</p>
                  <button
                    disabled
                    className="w-full max-w-xs py-4 rounded-xl text-white font-bold text-lg bg-slate-300 cursor-not-allowed flex justify-center mt-4"
                  >
                    CHECK-IN CA HỌC
                  </button>
                </>
              ) : (
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
              )
            ) : !isCheckedOut ? (
              <div className="w-full flex flex-col items-center">
                <h3 className="font-bold text-xl text-edu-success mb-4">Đã Check-in thành công</h3>
                
                <div className="bg-slate-50 w-full max-w-sm rounded-xl p-4 border mb-6 text-left space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Giờ vào:</span>
                    <span className="font-bold text-slate-800">{myAttendance.checkinTime ? new Date(myAttendance.checkinTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
                  </div>
                  {myAttendance.lateMinutes > 0 && (
                    <div className="flex justify-between border-b border-slate-200 pb-2 text-red-500">
                      <span>Đi trễ:</span>
                      <span className="font-bold">{myAttendance.lateMinutes} phút</span>
                    </div>
                  )}
                  {myAttendance.note && (
                    <div className="flex flex-col border-b border-slate-200 pb-2">
                      <span className="text-slate-500 mb-1">Ghi chú Check-in:</span>
                      <span className="italic text-slate-700 bg-white p-2 rounded border">"{myAttendance.note}"</span>
                    </div>
                  )}
                  {myAttendance.checkinImageUrl && (
                    <div className="flex flex-col pt-1">
                      <span className="text-slate-500 mb-2">Ảnh xác nhận:</span>
                      <img 
                        src={myAttendance.checkinImageUrl} 
                        alt="Check-in Selfie" 
                        loading="lazy" 
                        className="w-full h-auto object-cover rounded-lg border shadow-sm max-h-[250px]"
                      />
                    </div>
                  )}
                </div>

                <p className="text-sm text-edu-muted mb-4">
                  {isCheckoutLocked 
                    ? 'Đã quá ngày làm việc. Bạn không thể Check-out ca dạy này nữa.' 
                    : 'Vui lòng Check-out sau khi hoàn thành ca dạy.'}
                </p>
                
                {!isCheckoutLocked && (
                  <button
                    onClick={handleCheckOut}
                    disabled={checkOutMutation.isPending}
                    className="w-full max-w-xs py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-[#FF8A65] to-[#FFB74D] hover:shadow-lg active:scale-95 transition-all flex justify-center"
                  >
                    {checkOutMutation.isPending ? <Loader2 className="animate-spin" /> : 'CHECK-OUT KẾT THÚC'}
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="text-edu-success mb-2"><CheckCircle2 size={48} /></div>
                <h3 className="font-bold text-xl mb-4">Ca học đã hoàn thành</h3>
                
                <div className="bg-slate-50 w-full max-w-sm rounded-xl p-4 border mb-6 text-left space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Giờ vào:</span>
                    <span className="font-bold text-slate-800">{myAttendance.checkinTime ? new Date(myAttendance.checkinTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Giờ ra:</span>
                    <span className="font-bold text-slate-800">{myAttendance.checkoutTime ? new Date(myAttendance.checkoutTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
                  </div>
                  {myAttendance.earlyCheckoutMinutes > 0 && (
                    <div className="flex justify-between border-b border-slate-200 pb-2 text-orange-500">
                      <span>Ra sớm:</span>
                      <span className="font-bold">{myAttendance.earlyCheckoutMinutes} phút</span>
                    </div>
                  )}
                  {myAttendance.note && (
                    <div className="flex flex-col border-b border-slate-200 pb-2">
                      <span className="text-slate-500 mb-1">Ghi chú:</span>
                      <span className="italic text-slate-700 bg-white p-2 rounded border">"{myAttendance.note}"</span>
                    </div>
                  )}
                  {myAttendance.checkinImageUrl && (
                    <div className="flex flex-col pt-1">
                      <span className="text-slate-500 mb-2">Ảnh xác nhận Check-in:</span>
                      <img 
                        src={myAttendance.checkinImageUrl} 
                        alt="Check-in Selfie" 
                        loading="lazy" 
                        className="w-full h-auto object-cover rounded-lg border shadow-sm max-h-[250px]"
                      />
                    </div>
                  )}
                </div>

                <p className="text-sm text-edu-muted">Cảm ơn bạn đã hoàn thành tốt ca học.</p>
              </div>
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

      <AttendanceActionModal 
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        type={actionType}
        session={session}
        school={school}
        onSubmit={handleModalSubmit}
        isLoading={checkInMutation.isPending || checkOutMutation.isPending}
        isOutOfRange={isOutOfRange}
        setIsOutOfRange={setIsOutOfRange}
      />
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
    const handleMutationError = (err: any) => {
      const status = err.response?.status;
      let friendlyMsg = "Đã có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại sau.";
      if (status === 403) {
        friendlyMsg = "Bạn không có quyền gửi báo cáo cho ca học này (chưa được phân công).";
      } else if (status === 409) {
        friendlyMsg = "Báo cáo của ca học này đã tồn tại hoặc dữ liệu bị trùng lặp.";
      } else if (status === 400) {
        friendlyMsg = err.response?.data?.message || "Thông tin gửi lên không hợp lệ.";
      }
      toast.error(friendlyMsg);
    };

    if (isTeacher) {
      teacherMutation.mutate({
        lessonTaught: formData.lessonTaught,
        progress: formData.progress,
        teacherComment: formData.teacherComment,
        ratingForAssistant: formData.rating,
        feedbackForAssistant: formData.feedback
      }, {
        onSuccess: () => toast.success("Đã gửi báo cáo Giáo viên!"),
        onError: handleMutationError
      });
    } else {
      assistantMutation.mutate({
        assistantNote: formData.assistantNote,
        ratingForTeacher: formData.rating,
        feedbackForTeacher: formData.feedback
      }, {
        onSuccess: () => toast.success("Đã gửi báo cáo Trợ giảng!"),
        onError: handleMutationError
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
