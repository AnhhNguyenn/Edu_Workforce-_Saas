import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateRole } from '@/hooks/queries/useRoles';

interface EditRoleModalProps {
  role: any;
  onClose: () => void;
}

export default function EditRoleModal({ role, onClose }: EditRoleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || ''
      });
    }
  }, [role]);

  const updateMutation = useUpdateRole();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({ id: role.id, data: formData });
      onClose();
    } catch (err) {
      alert('Lỗi cập nhật chức vụ!');
      console.error(err);
    }
  };

  if (!role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-edu-border flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-edu-fg">Sửa Chức Vụ</h2>
          <button onClick={onClose} className="p-2 text-edu-muted hover:text-edu-fg rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {role.isSystemRole && (
            <div className="p-3 bg-orange-50 text-orange-800 text-sm rounded-lg mb-4">
              Đây là vai trò hệ thống. Bạn chỉ có thể sửa Mô tả, không thể sửa Tên.
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-edu-fgSecondary">Tên chức vụ <span className="text-red-500">*</span></label>
            <Input 
              required 
              disabled={role.isSystemRole}
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-edu-fgSecondary">Mô tả</label>
            <Input 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
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
