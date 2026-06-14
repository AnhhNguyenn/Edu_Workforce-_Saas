import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateStudent, useStudent } from '@/hooks/queries/useStudents';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { useClasses } from '@/hooks/queries/useClasses';
import { Controller } from 'react-hook-form';

const editStudentSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập Họ tên'),
  birthDate: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentEmail: z.string().email('Email không hợp lệ').or(z.literal('')),
  classId: z.string().optional()
});

type EditStudentFormValues = z.infer<typeof editStudentSchema>;

interface EditStudentModalProps {
  studentId: string;
  onClose: () => void;
}

export default function EditStudentModal({ studentId, onClose }: EditStudentModalProps) {
  const { data: studentDetail, isLoading } = useStudent(studentId);
  const updateMutation = useUpdateStudent();
  const { data: classesData } = useClasses('', '');

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<EditStudentFormValues>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
      fullName: '',
      birthDate: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      classId: ''
    }
  });

  useEffect(() => {
    if (studentDetail) {
      reset({
        fullName: studentDetail.fullName || '',
        birthDate: studentDetail.birthDate ? studentDetail.birthDate.split('T')[0] : '',
        parentName: studentDetail.parentName || '',
        parentPhone: studentDetail.parentPhone || '',
        parentEmail: studentDetail.parentEmail || '',
        classId: studentDetail.classId || ''
      });
    }
  }, [studentDetail, reset]);

  const onSubmit = async (data: EditStudentFormValues) => {
    try {
      const payload = {
        ...data,
        birthDate: data.birthDate || null
      };
      await updateMutation.mutateAsync({ id: studentId, data: payload });
      toast.success('Cập nhật học viên thành công!');
      onClose();
    } catch (err) {
      toast.error('Đã xảy ra lỗi khi cập nhật học viên.');
      console.error(err);
    }
  };

  if (isLoading || !studentDetail) return null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Cập nhật Học Viên"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>Hủy bỏ</Button>
          <Button 
            type="submit" 
            form="edit-student-form" 
            disabled={updateMutation.isPending} 
            className="bg-[#1976D2] hover:bg-[#1565C0] text-white"
          >
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Button>
        </>
      }
    >
      <form id="edit-student-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-edu-fgSecondary">Mã học viên</label>
            <Input disabled value={studentDetail.studentCode} className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-edu-fgSecondary">Họ và tên <span className="text-red-500">*</span></label>
            <Input 
              {...register('fullName')}
              error={errors.fullName?.message}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-edu-fgSecondary">Ngày sinh</label>
            <Input 
              type="date" 
              {...register('birthDate')}
              error={errors.birthDate?.message}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-edu-fgSecondary">Xếp lớp</label>
            <Controller
              control={control}
              name="classId"
              render={({ field }) => (
                <Select
                  options={classesData?.items?.map((c: any) => ({ value: c.id, label: c.name })) || []}
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
