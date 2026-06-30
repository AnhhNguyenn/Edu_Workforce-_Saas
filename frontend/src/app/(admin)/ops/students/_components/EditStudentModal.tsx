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
import { DatePicker } from '@/components/ui/date-picker';
import { useClasses } from '@/hooks/queries/useClasses';
import { useSchools } from '@/hooks/queries/useSchools';
import { Controller } from 'react-hook-form';

const editStudentSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập Họ tên'),
  birthDate: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentEmail: z.string().email('Email không hợp lệ').or(z.literal('')),
  schoolId: z.string().optional(),
  classId: z.string().optional(),
  statusCode: z.string().optional()
});

type EditStudentFormValues = z.infer<typeof editStudentSchema>;

interface EditStudentModalProps {
  studentId: string;
  onClose: () => void;
}

export default function EditStudentModal({ studentId, onClose }: EditStudentModalProps) {
  const { data: studentDetail, isLoading } = useStudent(studentId);
  const updateMutation = useUpdateStudent();
  const { data: schoolsData } = useSchools('');

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<EditStudentFormValues>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
      fullName: '',
      birthDate: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      schoolId: '',
      classId: '',
      statusCode: 'ACTIVE'
    }
  });

  const selectedSchoolId = watch('schoolId');
  const { data: classesData } = useClasses('', selectedSchoolId);

  useEffect(() => {
    if (studentDetail) {
      reset({
        fullName: studentDetail.fullName || '',
        birthDate: studentDetail.birthDate ? studentDetail.birthDate.split('T')[0] : '',
        parentName: studentDetail.parentName || '',
        parentPhone: studentDetail.parentPhone || '',
        parentEmail: studentDetail.parentEmail || '',
        schoolId: studentDetail.schoolId || '',
        classId: studentDetail.classId || '',
        statusCode: studentDetail.statusCode || 'ACTIVE'
      });
    }
  }, [studentDetail, reset]);

  const onSubmit = async (data: EditStudentFormValues) => {
    try {
      const payload = {
        ...data,
        birthDate: data.birthDate || null,
        classId: data.classId || null,
        statusCode: data.statusCode || 'ACTIVE'
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
            <label className="text-sm font-semibold text-edu-fgSecondary">Cơ sở</label>
            <Controller
              control={control}
              name="schoolId"
              render={({ field }) => (
                <Select
                  options={schoolsData?.items?.map((s: any) => ({ value: s.id, label: s.name })) || []}
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    setValue('classId', ''); // Reset class when school changes
                  }}
                  placeholder="Chọn cơ sở..."
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Lớp học</label>
            <Controller
              name="classId"
              control={control}
              render={({ field }) => (
                <Select
                  options={[
                    { value: '', label: 'Chưa xếp lớp' },
                    ...(classesData?.items?.map((c: any) => ({ value: c.id, label: c.name })) || [])
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={selectedSchoolId ? "Chọn lớp học..." : "Vui lòng chọn cơ sở trước"}
                  disabled={!selectedSchoolId}
                />
              )}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Trạng thái học tập</label>
            <Controller
              name="statusCode"
              control={control}
              render={({ field }) => (
                <Select
                  options={[
                    { value: 'ACTIVE', label: 'Đang học' },
                    { value: 'INACTIVE', label: 'Bảo lưu / Đã nghỉ' }
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Chọn trạng thái..."
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
