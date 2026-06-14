import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateStudent } from '@/hooks/queries/useStudents';
import { toast } from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Modal } from '@/components/ui/modal';
import { DatePicker } from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';
import { useClasses } from '@/hooks/queries/useClasses';

const studentSchema = z.object({
  studentCode: z.string().min(1, 'Vui lòng nhập Mã học viên'),
  fullName: z.string().min(1, 'Vui lòng nhập Họ tên'),
  birthDate: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentEmail: z.string().email('Email không hợp lệ').or(z.literal('')),
  classId: z.string().optional()
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface CreateStudentModalProps {
  onClose: () => void;
}

export default function CreateStudentModal({ onClose }: CreateStudentModalProps) {
  const createMutation = useCreateStudent();
  const { data: classesData } = useClasses('', '');

  const { register, handleSubmit, control, formState: { errors } } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      studentCode: '',
      fullName: '',
      birthDate: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      classId: ''
    }
  });

  const onSubmit = async (data: StudentFormValues) => {
    try {
      const payload = {
        ...data,
        birthDate: data.birthDate || null
      };
      await createMutation.mutateAsync(payload);
      toast.success('Thêm học viên thành công!');
      onClose();
    } catch (err) {
      toast.error('Đã xảy ra lỗi khi tạo mới học viên.');
      console.error(err);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Thêm Học Viên Mới"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>Hủy bỏ</Button>
          <Button 
            type="submit" 
            form="create-student-form" 
            disabled={createMutation.isPending} 
            className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white"
          >
            {createMutation.isPending ? 'Đang lưu...' : 'Lưu Học Viên'}
          </Button>
        </>
      }
    >
      <form id="create-student-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-edu-fgSecondary">Mã học viên <span className="text-red-500">*</span></label>
            <Input 
              {...register('studentCode')}
              error={errors.studentCode?.message}
              placeholder="VD: HV001" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-edu-fgSecondary">Họ và tên <span className="text-red-500">*</span></label>
            <Input 
              {...register('fullName')}
              error={errors.fullName?.message}
              placeholder="Nguyễn Văn A" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-edu-fgSecondary">Ngày sinh</label>
            <Controller
              control={control}
              name="birthDate"
              render={({ field }) => (
                <DatePicker 
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                  placeholderText="dd/mm/yyyy"
                />
              )}
            />
            {errors.birthDate?.message && <p className="text-sm text-red-500">{errors.birthDate.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-edu-fgSecondary">Xếp lớp (Tùy chọn)</label>
            <Controller
              control={control}
              name="classId"
              render={({ field }) => (
                <Select
                  options={classesData?.items?.map(c => ({ value: c.id, label: c.name })) || []}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Chọn lớp học..."
                />
              )}
            />
          </div>
        </div>

        <div className="border-t border-edu-border pt-4 mt-4">
          <h3 className="font-semibold text-edu-fg mb-4">Thông tin Phụ huynh</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-edu-fgSecondary">Họ tên Phụ huynh</label>
              <Input 
                {...register('parentName')}
                error={errors.parentName?.message}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-edu-fgSecondary">Số điện thoại</label>
              <Input 
                {...register('parentPhone')}
                error={errors.parentPhone?.message}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-semibold text-edu-fgSecondary">Email</label>
              <Input 
                type="email" 
                {...register('parentEmail')}
                error={errors.parentEmail?.message}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
