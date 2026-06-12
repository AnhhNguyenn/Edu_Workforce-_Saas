import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateRole } from '@/hooks/queries/useRoles';
import { Portal } from '@/components/ui/portal';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const roleSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên chức vụ'),
  description: z.string().optional()
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface EditRoleModalProps {
  role: any;
  onClose: () => void;
}

export default function EditRoleModal({ role, onClose }: EditRoleModalProps) {
  const updateMutation = useUpdateRole();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || ''
    }
  });

  useEffect(() => {
    if (role) {
      reset({
        name: role.name || '',
        description: role.description || ''
      });
    }
  }, [role, reset]);

  const onSubmit = async (data: RoleFormValues) => {
    try {
      await updateMutation.mutateAsync({ id: role.id, data });
      toast.success('Cập nhật chức vụ thành công!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật chức vụ!');
    }
  };

  if (!role) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-edu-border flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
            <h2 className="text-xl font-bold text-edu-fg">Sửa Chức Vụ</h2>
            <button onClick={onClose} className="p-2 text-edu-muted hover:text-edu-fg rounded-full hover:bg-gray-200 transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {role.isSystemRole && (
              <div className="p-3 bg-orange-50 text-orange-800 text-sm rounded-lg mb-4">
                Đây là vai trò hệ thống. Bạn chỉ có thể sửa Mô tả, không thể sửa Tên.
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-edu-fgSecondary">Tên chức vụ <span className="text-red-500">*</span></label>
              <Input 
                disabled={role.isSystemRole}
                {...register('name')}
                error={errors.name?.message}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-edu-fgSecondary">Mô tả</label>
              <Input 
                {...register('description')}
                error={errors.description?.message}
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
    </Portal>
  );
}
