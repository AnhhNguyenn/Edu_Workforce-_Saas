import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateRole } from '@/hooks/queries/useRoles';
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

interface CreateRoleModalProps {
  onClose: () => void;
}

export default function CreateRoleModal({ onClose }: CreateRoleModalProps) {
  const createMutation = useCreateRole();

  const { register, handleSubmit, formState: { errors } } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const onSubmit = async (data: RoleFormValues) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Tạo chức vụ mới thành công!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi tạo chức vụ mới!');
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-edu-border flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-edu-fg">Tạo Chức Vụ Mới</h2>
          <button onClick={onClose} className="p-2 text-edu-muted hover:text-edu-fg rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-edu-fgSecondary">Tên chức vụ <span className="text-red-500">*</span></label>
            <Input 
              {...register('name')} 
              error={errors.name?.message}
              placeholder="VD: Quản lý chi nhánh" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-edu-fgSecondary">Mô tả</label>
            <Input 
              {...register('description')} 
              error={errors.description?.message}
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
    </Portal>
  );
}
