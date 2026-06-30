import { useStudent } from '@/hooks/queries/useStudents';
import { Modal } from '@/components/ui/modal';
import { Loader2, User, BookOpen, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ViewStudentModalProps {
  studentId: string;
  onClose: () => void;
}

export default function ViewStudentModal({ studentId, onClose }: ViewStudentModalProps) {
  const { data: student, isLoading } = useStudent(studentId);

  return (
    <Modal isOpen onClose={onClose} title="Chi tiết Học viên">
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-edu-accent" />
        </div>
      ) : !student ? (
        <div className="text-center py-10 text-edu-muted">Không tìm thấy thông tin học viên.</div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-edu-accentLighter text-edu-accent flex items-center justify-center text-2xl font-bold">
              {student.fullName?.charAt(0) || <User />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-edu-fg">{student.fullName}</h3>
              <div className="text-edu-muted text-sm mt-1">Mã HV: {student.studentCode}</div>
              <div className="mt-2 flex gap-2">
                <Badge variant={student.statusCode === 'ACTIVE' ? 'success' : 'warn'}>
                  {student.statusCode === 'ACTIVE' ? 'Đang học' : 'Bảo lưu'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-edu-fg border-b pb-2">Thông tin cá nhân</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-edu-muted mt-0.5" />
                  <div>
                    <div className="text-edu-muted text-xs">Ngày sinh</div>
                    <div className="font-medium">{student.birthDate ? new Date(student.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold text-edu-fg border-b pb-2 pt-4">Thông tin phụ huynh</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-edu-muted mt-0.5" />
                  <div>
                    <div className="text-edu-muted text-xs">Họ tên phụ huynh</div>
                    <div className="font-medium">{student.parentName || 'Chưa cập nhật'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-edu-muted mt-0.5" />
                  <div>
                    <div className="text-edu-muted text-xs">Số điện thoại</div>
                    <div className="font-medium">{student.parentPhone || 'Chưa cập nhật'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-edu-muted mt-0.5" />
                  <div>
                    <div className="text-edu-muted text-xs">Email</div>
                    <div className="font-medium">{student.parentEmail || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-edu-fg border-b pb-2">Thông tin học tập</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-edu-muted mt-0.5" />
                  <div>
                    <div className="text-edu-muted text-xs">Lớp học hiện tại</div>
                    <div className="font-medium">{student.currentClass || 'Chưa xếp lớp'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-edu-muted mt-0.5" />
                  <div>
                    <div className="text-edu-muted text-xs">Cơ sở</div>
                    <div className="font-medium">{student.currentSchool || 'Chưa phân bổ'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-edu-accent text-edu-accent flex items-center justify-center font-bold text-[10px] mt-0.5">₫</div>
                  <div>
                    <div className="text-edu-muted text-xs">Tình trạng học phí</div>
                    <div className="font-medium text-edu-accent">{student.feeStatus || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
