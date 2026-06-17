import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';
import { Portal } from '@/components/ui/portal';
import { PromotionDto, useCreatePromotion, useUpdatePromotion, usePlans } from '@/hooks/queries/useSubscriptions';
import { toast } from 'react-hot-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const promotionSchema = z.object({
  type: z.enum(['PROMO_CODE', 'AUTO_DISCOUNT']),
  code: z.string().max(50, 'Mã giảm giá không được vượt quá 50 ký tự').optional(),
  discountPercentage: z.number({ message: "Vui lòng nhập số hợp lệ" }).min(0, 'Giảm giá phải từ 0-100').max(100, 'Tối đa 100%'),
  startDate: z.string().min(1, 'Vui lòng chọn từ ngày'),
  endDate: z.string().min(1, 'Vui lòng chọn đến ngày'),
  maxUses: z.string().optional(),
  subscriptionPlanId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'PROMO_CODE' && (!data.code || data.code.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng nhập Mã Code cho loại này',
      path: ['code']
    });
  }
  if (data.type === 'AUTO_DISCOUNT' && (!data.subscriptionPlanId || data.subscriptionPlanId === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng chọn Gói cước để áp dụng',
      path: ['subscriptionPlanId']
    });
  }
  if (new Date(data.endDate) < new Date(data.startDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Đến ngày phải sau Từ ngày',
      path: ['endDate']
    });
  }
});

type PromotionFormValues = z.infer<typeof promotionSchema>;

interface PromotionModalProps {
  promo?: PromotionDto | null;
  onClose: () => void;
}

export function PromotionModal({ promo, onClose }: PromotionModalProps) {
  const isEditing = !!promo;
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();
  const { data: plans } = usePlans();

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      type: 'PROMO_CODE',
      code: '',
      discountPercentage: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      maxUses: '',
      subscriptionPlanId: ''
    }
  });

  const watchType = watch('type');
  const watchStartDate = watch('startDate');

  useEffect(() => {
    if (promo) {
      reset({
        code: promo.code || '',
        type: (promo.type as 'PROMO_CODE' | 'AUTO_DISCOUNT') || 'PROMO_CODE',
        discountPercentage: promo.discountPercentage || 0,
        startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
        endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
        maxUses: promo.maxUses ? promo.maxUses.toString() : '',
        subscriptionPlanId: promo.subscriptionPlanId || ''
      });
    } else {
      reset({
        type: 'PROMO_CODE',
        code: '',
        discountPercentage: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        maxUses: '',
        subscriptionPlanId: ''
      });
    }
  }, [promo, reset]);

  const onSubmit = async (data: PromotionFormValues) => {
    try {
      const submitData = {
        ...data,
        maxUses: data.maxUses && data.maxUses.trim() !== '' ? parseInt(data.maxUses, 10) : null,
        code: data.type === 'AUTO_DISCOUNT' ? null : data.code,
        subscriptionPlanId: data.type === 'PROMO_CODE' ? null : data.subscriptionPlanId
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: promo.id, data: submitData });
        toast.success('Cập nhật mã giảm giá thành công');
      } else {
        await createMutation.mutateAsync(submitData);
        toast.success('Tạo mã giảm giá mới thành công');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại khuyến mãi <span className="text-red-500">*</span></label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onChange={(val) => {
                         field.onChange(val);
                         if (val === 'AUTO_DISCOUNT') reset({ ...watch(), type: val, code: '' });
                         if (val === 'PROMO_CODE') reset({ ...watch(), type: val, subscriptionPlanId: '' });
                      }}
                      options={[
                        { value: 'PROMO_CODE', label: 'Nhập mã Code' },
                        { value: 'AUTO_DISCOUNT', label: 'Giảm trực tiếp (Auto)' }
                      ]}
                    />
                  )}
                />
                {errors.type && <p className="mt-1 text-xs text-edu-danger">{errors.type.message}</p>}
              </div>
              
              {watchType === 'PROMO_CODE' ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã Code <span className="text-red-500">*</span></label>
                  <Input {...register('code')} error={errors.code?.message} placeholder="Ví dụ: SUMMER26" />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Áp dụng cho Gói cước <span className="text-red-500">*</span></label>
                  <Controller
                    name="subscriptionPlanId"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        value={field.value} 
                        onChange={field.onChange}
                        options={plans?.map(p => ({ value: p.id, label: p.name })) || []}
                        placeholder="Chọn gói cước..."
                      />
                    )}
                  />
                  {errors.subscriptionPlanId && <p className="mt-1 text-xs text-edu-danger">{errors.subscriptionPlanId.message}</p>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">% Giảm giá <span className="text-red-500">*</span></label>
              <Input {...register('discountPercentage', { valueAsNumber: true })} type="number" min="0" max="100" error={errors.discountPercentage?.message} placeholder="Ví dụ: 20" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày <span className="text-red-500">*</span></label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker 
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    />
                  )}
                />
                {errors.startDate && <p className="mt-1 text-xs text-edu-danger">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày <span className="text-red-500">*</span></label>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker 
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                      minDate={watchStartDate ? new Date(watchStartDate) : undefined}
                    />
                  )}
                />
                {errors.endDate && <p className="mt-1 text-xs text-edu-danger">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn số lượt dùng</label>
              <Input {...register('maxUses')} type="number" min="1" error={errors.maxUses?.message} placeholder="Để trống nếu không giới hạn" />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>Hủy bỏ</Button>
              <Button type="submit" className="bg-edu-accent hover:bg-blue-600 min-w-32" disabled={isPending}>
                {isPending ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? 'Lưu thay đổi' : 'Tạo mã')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
