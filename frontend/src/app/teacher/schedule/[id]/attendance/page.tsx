'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useSubmitStudentAttendances } from '@/hooks/queries/useAttendances';
import { ChevronLeft, Loader2, Users, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AttendancePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [attendanceState, setAttendanceState] = useState<Record<string, { isPresent: boolean; note: string }>>({});

  // Fetch session detail to get ClassId
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/sessions/${sessionId}`);
      return res.data;
    },
    enabled: !!sessionId
  });

  // Fetch students of the class
  const classId = session?.classId;
  const { data: students, isLoading: isStudentsLoading } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: async () => {
      const res = await apiClient.get<any[]>(`/classes/${classId}/students`);
      return res.data;
    },
    enabled: !!classId
  });

  const submitMutation = useSubmitStudentAttendances(sessionId);

  // Initialize state when students load
  useEffect(() => {
    if (students && students.length > 0 && Object.keys(attendanceState).length === 0) {
      const initial: Record<string, { isPresent: boolean; note: string }> = {};
      students.forEach(s => {
        initial[s.id] = { isPresent: true, note: '' };
      });
      setAttendanceState(initial);
    }
  }, [students]);

  const handleToggle = (studentId: string, isPresent: boolean) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], isPresent }
    }));
  };

  const handleSubmit = () => {
    const records = Object.keys(attendanceState).map(studentId => ({
      studentId,
      isPresent: attendanceState[studentId].isPresent,
      note: attendanceState[studentId].note
    }));

    submitMutation.mutate({ records }, {
      onSuccess: () => {
        toast.success("Đã nộp điểm danh thành công!");
        router.back();
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.message || "Có lỗi xảy ra khi nộp điểm danh");
      }
    });
  };

  if (isSessionLoading || isStudentsLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-edu-accent" size={32} /></div>;
  }

  return (
    <div className="space-y-4 pb-20 -mt-2">
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-edu-border">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-edu-fg leading-tight">Điểm danh học sinh</h2>
          <p className="text-xs text-edu-muted">Ca: {session?.startTime?.substring(0, 5)} — {new Date(session?.sessionDate).toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-edu-fg">
          <Users size={16} className="text-edu-accent" />
          <span>Sĩ số: {students?.length || 0}</span>
        </div>
        <div className="text-xs font-semibold text-edu-success">
          Có mặt: {Object.values(attendanceState).filter(a => a.isPresent).length}
        </div>
      </div>

      <div className="space-y-3">
        {students && students.length > 0 ? (
          students.map((student: any) => {
            const state = attendanceState[student.id];
            if (!state) return null;

            return (
              <div key={student.id} className="bg-white p-4 rounded-xl border border-edu-border shadow-sm flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-edu-fg">{student.fullName}</div>
                  <div className="text-xs text-edu-muted">Mã: {student.studentCode || student.id.substring(0, 8)}</div>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => handleToggle(student.id, true)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${state.isPresent ? 'bg-edu-success text-white shadow-sm' : 'text-gray-500'}`}
                  >
                    Có mặt
                  </button>
                  <button 
                    onClick={() => handleToggle(student.id, false)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${!state.isPresent ? 'bg-edu-danger text-white shadow-sm' : 'text-gray-500'}`}
                  >
                    Vắng
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-edu-muted text-sm border border-dashed rounded-xl border-edu-border">
            Lớp chưa có học sinh nào.
          </div>
        )}
      </div>

      <div className="fixed bottom-[80px] left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <div className="w-full sm:w-[390px] mx-auto pointer-events-auto">
          <button 
            onClick={handleSubmit}
            disabled={submitMutation.isPending || !students || students.length === 0}
            className="w-full py-4 rounded-xl text-white font-bold text-base bg-gradient-to-r from-edu-accent to-[#7BC4FF] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            LƯU ĐIỂM DANH
          </button>
        </div>
      </div>
    </div>
  );
}
