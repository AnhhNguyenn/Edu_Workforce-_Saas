import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateStudent, useStudent } from '@/hooks/queries/useStudents';

interface EditStudentModalProps {
  studentId: string;
  onClose: () => void;
}

export default function EditStudentModal({ studentId, onClose }: EditStudentModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    parentName: '',
    parentPhone: '',
    parentEmail: ''
  });

  const { data: studentDetail, isLoading } = useStudent(studentId);

  useEffect(() => {
    if (studentDetail) {
      setFormData({
        fullName: studentDetail.fullName || '',
        birthDate: studentDetail.birthDate ? studentDetail.birthDate.split('T')[0] : '',
        parentName: studentDetail.parentName || '',
        parentPhone: studentDetail.parentPhone || '',
        parentEmail: studentDetail.parentEmail || ''
      });
    }
  }, [studentDetail]);

  const updateMutation = useUpdateStudent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        birthDate: formData.birthDate || null
      };
      await updateMutation.mutateAsync({ id: studentId, data: payload });
      onClose();
    } catch (err) {
      alert('Đã xảy ra lỗi khi cập nhật học viên.');
      console.error(err);
    }
  };

  if (isLoading || !studentDetail) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-edu-border flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-edu-fg">Cập nhật Học Viên</h2>
          <button onClick={onClose} className="p-2 text-edu-muted hover:text-edu-fg rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-edu-fgSecondary">Mã học viên</label>
              <Input disabled value={studentDetail.studentCode} className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-edu-fgSecondary">Họ và tên <span className="text-red-500">*</span></label>
              <Input 
                required 
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-edu-fgSecondary">Ngày sinh</label>
              <Input 
                type="date" 
                value={formData.birthDate} 
                onChange={e => setFormData({...formData, birthDate: e.target.value})} 
              />
            </div>
          </div>

          <div className="border-t border-edu-border pt-4 mt-4">
            <h3 className="font-semibold text-edu-fg mb-4">Thông tin Phụ huynh</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-edu-fgSecondary">Họ tên Phụ huynh</label>
                <Input 
                  value={formData.parentName} 
                  onChange={e => setFormData({...formData, parentName: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-edu-fgSecondary">Số điện thoại</label>
                <Input 
                  value={formData.parentPhone} 
                  onChange={e => setFormData({...formData, parentPhone: e.target.value})} 
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-semibold text-edu-fgSecondary">Email</label>
                <Input 
                  type="email" 
                  value={formData.parentEmail} 
                  onChange={e => setFormData({...formData, parentEmail: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-edu-border">
            <Button type="button" variant="outline" onClick={onClose}>Hủy bỏ</Button>
            <Button type="submit" disabled={updateMutation.isPending} className="bg-[#1976D2] hover:bg-[#1565C0]">
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
