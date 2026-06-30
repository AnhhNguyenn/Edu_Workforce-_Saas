import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useClassDetails, useClassStudents } from '@/hooks/queries/useClasses';
import { Button } from '@/components/ui/button';

interface ViewClassModalProps {
  classId: string;
  onClose: () => void;
}

export default function ViewClassModal({ classId, onClose }: ViewClassModalProps) {
  const { data: classDetails, isLoading: isDetailsLoading } = useClassDetails(classId);
  const { data: classStudents, isLoading: isStudentsLoading } = useClassStudents(classId);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Chi tiết lớp học"
      footer={
        <Button variant="secondary" onClick={onClose}>Đóng</Button>
      }
    >
      {isDetailsLoading ? (
        <div className="py-10 text-center"><Loader2 className="animate-spin inline mr-2 text-edu-accent" /> Đang tải thông tin...</div>
      ) : classDetails ? (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-lg font-bold text-edu-fg mb-3">{classDetails.name}</h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div>
                <span className="text-gray-500 block text-xs">Cơ sở</span>
                <span className="font-medium">{classDetails.schoolName || 'Chưa phân bổ'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Niên khóa</span>
                <span className="font-medium">{classDetails.academicYear || '-'}</span>
              </div>

              <div>
                <span className="text-gray-500 block text-xs">Trạng thái</span>
                <Badge variant={classDetails.statusCode === 'ACTIVE' ? 'success' : 'warn'} className="mt-1">
                  {classDetails.statusCode === 'ACTIVE' ? 'Đang học' : 'Sắp khai giảng'}
                </Badge>
              </div>
            </div>
            
            {classDetails.description && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-gray-500 block text-xs mb-1">Mô tả thêm</span>
                <span className="font-medium text-sm text-edu-fg">{classDetails.description}</span>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-bold text-edu-fg mb-3 flex justify-between items-center">
              Danh sách học viên
              <Badge variant="muted">{classStudents?.length || 0} học viên</Badge>
            </h4>
            {isStudentsLoading ? (
              <div className="py-4 text-center text-sm text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Đang tải...</div>
            ) : classStudents && classStudents.length > 0 ? (
              <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <Table className="whitespace-nowrap text-sm">
                  <TableHeader className="bg-gray-50 sticky top-0">
                    <TableRow>
                      <TableHead>Mã HV</TableHead>
                      <TableHead>Họ Tên</TableHead>
                      <TableHead>SĐT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.map((student: any) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-xs">{student.studentCode || '-'}</TableCell>
                        <TableCell className="font-medium">{student.fullName}</TableCell>
                        <TableCell>{student.phoneNumber || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                Lớp học này chưa có học viên nào.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-10 text-center text-red-500">Không tìm thấy thông tin lớp học.</div>
      )}
    </Modal>
  );
}
