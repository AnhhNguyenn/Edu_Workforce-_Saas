import { useState, useEffect } from 'react';
import { X, Check, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStudents } from '@/hooks/queries/useStudents';
import { useSubmitAttendance } from '@/hooks/queries/useSessions';
import { toast } from 'react-hot-toast';

interface AttendanceModalProps {
  session: any;
  onClose: () => void;
}

export function AttendanceModal({ session, onClose }: AttendanceModalProps) {
  const { data: studentsData, isLoading } = useStudents();
  const submitAttendance = useSubmitAttendance();
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (studentsData?.items) {
      const initial: Record<string, boolean> = {};
      studentsData.items.forEach((s: any) => {
        initial[s.id] = true; // Mặc định có mặt
      });
      setAttendance(initial);
    }
  }, [studentsData]);

  const toggleAttendance = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async () => {
    const records = Object.keys(attendance).map(studentId => ({
      studentId,
      isPresent: attendance[studentId],
      note: ''
    }));

    try {
      await submitAttendance.mutateAsync({
        sessionId: session.id,
        data: { records }
      });
      toast.success('Đã lưu điểm danh thành công!');
      onClose();
    } catch (e) {
      toast.error('Lỗi lưu điểm danh');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-edu-border flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-edu-fg">Điểm danh lớp {session.classId?.substring(0,8)}</h2>
            <p className="text-sm text-edu-muted">Ca học: {session.startTime?.substring(0,5)} - {session.endTime?.substring(0,5)}</p>
          </div>
          <button onClick={onClose} className="p-2 text-edu-muted hover:text-edu-fg rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4 text-edu-muted">Đang tải danh sách học viên...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học viên</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsData?.items?.slice(0, 10).map((s: any) => ( // Demo: lấy 10 học sinh
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-edu-fg">{s.fullName}</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        size="sm" 
                        variant={attendance[s.id] ? "primary" : "outline"}
                        className={attendance[s.id] ? "bg-green-600 hover:bg-green-700 text-white w-28" : "text-red-500 border-red-500 hover:bg-red-50 w-28"}
                        onClick={() => toggleAttendance(s.id)}
                      >
                        {attendance[s.id] ? <><Check size={16} className="mr-1"/> Có mặt</> : <><XIcon size={16} className="mr-1"/> Vắng</>}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="p-6 border-t border-edu-border bg-gray-50/50 rounded-b-2xl flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button 
            className="bg-[#4CAF50] hover:bg-[#388E3C] text-white" 
            onClick={handleSubmit}
            disabled={submitAttendance.isPending}
          >
            {submitAttendance.isPending ? 'Đang lưu...' : 'Chốt điểm danh'}
          </Button>
        </div>
      </div>
    </div>
  );
}
