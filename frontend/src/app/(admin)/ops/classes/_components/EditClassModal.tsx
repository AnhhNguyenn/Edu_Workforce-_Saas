import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateClass, useClassDetails } from '@/hooks/queries/useClasses';
import { toast } from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { useSchools } from '@/hooks/queries/useSchools';

const editClassSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên lớp'),
  schoolId: z.string().min(1, 'Vui lòng chọn cơ sở'),
  academicYear: z.string().optional(),
  description: z.string().optional(),
  statusCode: z.string().optional()
});

type EditClassFormValues = z.infer<typeof editClassSchema>;

interface EditClassModalProps {
  initialData: any;
  onClose: () => void;
}

export default function EditClassModal({ initialData, onClose }: EditClassModalProps) {
  const updateMutation = useUpdateClass();
  const { data: schools } = useSchools('');
  const { data: classDetails, isLoading: isDetailsLoading } = useClassDetails(initialData?.id);

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<EditClassFormValues>({
    resolver: zodResolver(editClassSchema),
    defaultValues: {
      name: '',
      schoolId: '',
      description: '',
      statusCode: 'ACTIVE'
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        schoolId: initialData.schoolId || '',
        academicYear: initialData.academicYear || '',
        statusCode: initialData.statusCode || 'ACTIVE'
      });
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (classDetails) {
      setValue('description', classDetails.description || '');
    }
  }, [classDetails, setValue]);

  const onSubmit = async (data: EditClassFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: initialData.id,
        data: {
          name: data.name,
          schoolId: data.schoolId,
          academicYear: data.academicYear || undefined,
          description: data.description || undefined,
          statusCode: data.statusCode
        }
      });
      toast.success('Cập nhật lớp thành công!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật lớp học.');
      console.error(err);
    }
  };

  if (!initialData) return null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Sửa thông tin lớp học"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
          <Button 
            type="submit" 
            form="edit-class-form" 
            disabled={updateMutation.isPending} 
            className="bg-[#4CAF50] hover:bg-[#388E3C] text-white gap-2"
          >
            {updateMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu lớp'}
          </Button>
        </>
      }
    >
      <form id="edit-class-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Tên lớp học <span className="text-red-500">*</span></label>
            <Input 
              {...register('name')}
              error={errors.name?.message}
              placeholder="Nhập tên lớp..." 
              className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Niên khóa</label>
            <Input 
              {...register('academicYear')}
              placeholder="VD: 2024-2025, K48..." 
              className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Cơ sở trực thuộc <span className="text-red-500">*</span></label>
            <Controller
              control={control}
              name="schoolId"
              render={({ field }) => (
                <Select 
                  options={schools?.items?.map((s: any) => ({ value: s.id, label: s.name })) || []}
                  placeholder="Chọn cơ sở..."
                  className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.schoolId?.message && <p className="text-sm text-red-500 mt-1">{errors.schoolId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Mô tả thêm</label>
            <Input 
              {...register('description')}
              placeholder="Lớp tiếng Anh..." 
              className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Trạng thái lớp học</label>
            <Controller
              control={control}
              name="statusCode"
              render={({ field }) => (
                <Select 
                  options={[
                    { value: 'ACTIVE', label: 'Đang học' },
                    { value: 'INACTIVE', label: 'Sắp khai giảng / Đã đóng' }
                  ]}
                  placeholder="Chọn trạng thái..."
                  className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
