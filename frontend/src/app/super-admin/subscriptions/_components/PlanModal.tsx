import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2 } from 'lucide-react';
import { Portal } from '@/components/ui/portal';
import { SubscriptionPlanDto, useCreatePlan, useUpdatePlan } from '@/hooks/queries/useSubscriptions';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const planSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên gói cước'),
  description: z.string().optional(),
  maxUsers: z.coerce.number({ invalid_type_error: "Vui lòng nhập số hợp lệ" }).min(1, 'Giới hạn người dùng phải lớn hơn 0'),
  pricePerMonth: z.coerce.number({ invalid_type_error: "Vui lòng nhập giá hợp lệ" }).min(0, 'Giá 1 tháng không hợp lệ'),
  pricePerYear: z.coerce.number({ invalid_type_error: "Vui lòng nhập giá hợp lệ" }).min(0, 'Giá 1 năm không hợp lệ')
});

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanModalProps {
  plan?: SubscriptionPlanDto | null;
  onClose: () => void;
}

export function PlanModal({ plan, onClose }: PlanModalProps) {
  const isEditing = !!plan;
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      maxUsers: 50,
      pricePerMonth: 0,
      pricePerYear: 0
    }
  });

  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name || '',
        description: plan.description || '',
        maxUsers: plan.maxUsers || 50,
        pricePerMonth: plan.pricePerMonth || 0,
        pricePerYear: plan.pricePerYear || 0
      });
    } else {
      reset({
        name: '',
        description: '',
        maxUsers: 50,
        pricePerMonth: 0,
        pricePerYear: 0
      });
    }
  }, [plan, reset]);

  const onSubmit = async (data: PlanFormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: plan.id, data });
        toast.success('Cập nhật gói cước thành công');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Tạo gói cước mới thành công');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Sửa gói cước' : 'Tạo gói cước mới'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên gói cước <span className="text-red-500">*</span></label>
              <Input {...register('name')} error={errors.name?.message} placeholder="Ví dụ: Gói Cơ Bản" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn gọn</label>
              <Input {...register('description')} error={errors.description?.message} placeholder="Phù hợp cho trung tâm nhỏ..." />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn số lượng tài khoản (Users) <span className="text-red-500">*</span></label>
              <Input {...register('maxUsers')} type="number" min="1" error={errors.maxUsers?.message} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá 1 Tháng (VNĐ) <span className="text-red-500">*</span></label>
                <Input {...register('pricePerMonth')} type="number" min="0" error={errors.pricePerMonth?.message} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá 1 Năm (VNĐ) <span className="text-red-500">*</span></label>
                <Input {...register('pricePerYear')} type="number" min="0" error={errors.pricePerYear?.message} />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>Hủy bỏ</Button>
              <Button type="submit" className="bg-edu-accent hover:bg-blue-600 min-w-32" disabled={isPending}>
                {isPending ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? 'Lưu thay đổi' : 'Tạo gói')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
