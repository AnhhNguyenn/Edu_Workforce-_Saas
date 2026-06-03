import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateRole } from '@/hooks/queries/useRoles';

interface CreateRoleModalProps {
  onClose: () => void;
}

export default function CreateRoleModal({ onClose }: CreateRoleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const createMutation = useCreateRole();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      onClose();
    } catch (err) {
      alert('Lỗi tạo chức vụ mới!');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-edu-border flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-edu-fg">Tạo Chức Vụ Mới</h2>
          <button onClick={onClose} className="p-2 text-edu-muted hover:text-edu-fg rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-edu-fgSecondary">Tên chức vụ <span className="text-red-500">*</span></label>
            <Input 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="VD: Quản lý chi nhánh" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-edu-fgSecondary">Mô tả</label>
            <Input 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="Mô tả chức năng công việc" 
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-edu-border">
            <Button type="button" variant="outline" onClick={onClose}>Hủy bỏ</Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-[#7B1FA2] hover:bg-[#6A1B9A]">
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo Mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
