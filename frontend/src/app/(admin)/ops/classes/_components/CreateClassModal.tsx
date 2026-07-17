import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateClass } from '@/hooks/queries/useClasses';
import { toast } from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { useSchools } from '@/hooks/queries/useSchools';

const classSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên lớp'),
  schoolId: z.string().min(1, 'Vui lòng chọn cơ sở'),
  academicYear: z.string().optional(),
  description: z.string().optional()
});

type ClassFormValues = z.infer<typeof classSchema>;

interface CreateClassModalProps {
  onClose: () => void;
}

export default function CreateClassModal({ onClose }: CreateClassModalProps) {
  const createMutation = useCreateClass();
  const { data: schools } = useSchools('');

  const { register, handleSubmit, control, formState: { errors } } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      schoolId: '',
      academicYear: '',
      description: ''
    }
  });

  const onSubmit = async (data: ClassFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        schoolId: data.schoolId,
        academicYear: data.academicYear || undefined,
        description: data.description || undefined
      });
      toast.success('Mở lớp thành công!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đã xảy ra lỗi khi tạo mới lớp học.');
      console.error(err);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Mở lớp mới"
      overflowVisible={true}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
          <Button 
            type="submit" 
            form="create-class-form" 
            disabled={createMutation.isPending} 
            className="bg-[#4CAF50] hover:bg-[#388E3C] text-white gap-2"
          >
            {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            {createMutation.isPending ? 'Đang tạo...' : 'Tạo lớp'}
          </Button>
        </>
      }
    >
      <form id="create-class-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  options={schools?.items?.map(s => ({ value: s.id, label: s.name })) || []}
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
        </div>
      </form>
    </Modal>
  );
}
