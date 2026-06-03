import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateStudent } from '@/hooks/queries/useStudents';

interface CreateStudentModalProps {
  onClose: () => void;
}

export default function CreateStudentModal({ onClose }: CreateStudentModalProps) {
  const [formData, setFormData] = useState({
    studentCode: '',
    fullName: '',
    birthDate: '',
    parentName: '',
    parentPhone: '',
    parentEmail: ''
  });

  const createMutation = useCreateStudent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        birthDate: formData.birthDate || null
      };
      await createMutation.mutateAsync(payload);
      onClose();
    } catch (err) {
      alert('Đã xảy ra lỗi khi tạo mới học viên.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-edu-border flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-edu-fg">Thêm Học Viên Mới</h2>
          <button onClick={onClose} className="p-2 text-edu-muted hover:text-edu-fg rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-edu-fgSecondary">Mã học viên <span className="text-red-500">*</span></label>
              <Input 
                required 
                value={formData.studentCode} 
                onChange={e => setFormData({...formData, studentCode: e.target.value})} 
                placeholder="VD: HV001" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-edu-fgSecondary">Họ và tên <span className="text-red-500">*</span></label>
              <Input 
                required 
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})} 
                placeholder="Nguyễn Văn A" 
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
            <Button type="submit" disabled={createMutation.isPending} className="bg-[#2E7D32] hover:bg-[#1B5E20]">
              {createMutation.isPending ? 'Đang lưu...' : 'Lưu Học Viên'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
