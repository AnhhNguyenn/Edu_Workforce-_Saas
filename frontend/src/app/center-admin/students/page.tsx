'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useStudents, useExportStudents, useImportStudents, useDeleteStudent } from '@/hooks/queries/useStudents';
import { useDebounce } from '@/hooks/useDebounce';
import { StudentTable } from './_components/StudentTable';
import { StudentToolbar } from './_components/StudentToolbar';
import { toast } from 'react-hot-toast';
import { useProfile } from '@/hooks/queries/useProfile';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/providers/ConfirmProvider';

// Áp dụng Lazy Load cho Modal
const CreateStudentModal = dynamic(() => import('./_components/CreateStudentModal'), { 
  ssr: false,
  loading: () => null 
});

const EditStudentModal = dynamic(() => import('./_components/EditStudentModal'), { 
  ssr: false,
  loading: () => null 
});

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const { confirm } = useConfirm();
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data = {}, isLoading } = useStudents(debouncedSearch);
  const students = data.items || [];

  const { data: profile } = useProfile();
  const isAuthorized = profile?.role === 'SUPER_ADMIN' || profile?.role === 'CENTER_ADMIN';

  const exportMutation = useExportStudents();
  const importMutation = useImportStudents();
  const deleteMutation = useDeleteStudent();

  const handleExport = async () => {
    try {
      const data = await exportMutation.mutateAsync();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students.xlsx');
      document.body.appendChild(link);
      link.click();
      toast.success('Xuất file thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi xuất file');
    }
  };

  const handleImport = async (file: File) => {
    try {
      await importMutation.mutateAsync(file);
      toast.success('Nhập file thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi nhập file. Vui lòng kiểm tra định dạng .xlsx');
    }
  };

  const handleDeleteClick = (studentId: string) => {
    confirm({
      title: "Xóa Học sinh",
      description: "Bạn có chắc chắn muốn xóa học viên này? Hành động này sẽ xóa toàn bộ hồ sơ, lịch sử điểm danh và điểm số của học viên.",
      requireInput: true,
      expectedInput: "XAC NHAN",
      action: async () => {
        try {
          await deleteMutation.mutateAsync(studentId);
          toast.success("Đã xóa học viên!");
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Lỗi xóa học viên");
        }
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Quản lý Học sinh</h2>
          <p className="text-edu-muted text-sm">Quản lý danh sách học viên, hồ sơ và trạng thái học tập</p>
        </div>
      </div>
      
      <StudentToolbar 
        onExport={handleExport} 
        isExporting={exportMutation.isPending} 
        onImport={handleImport}
        isImporting={importMutation.isPending}
        searchKeyword={searchTerm}
        onSearch={setSearchTerm}
        onOpenCreate={() => setShowCreate(true)}
        onOpenFilter={() => setIsFilterOpen(true)}
        isAuthorized={isAuthorized}
      />
      <StudentTable 
        students={students} 
        isLoading={isLoading} 
        onEdit={(student) => setEditingStudentId(student.id)}
        onDelete={handleDeleteClick}
        isAuthorized={isAuthorized}
      />

      {showCreate && <CreateStudentModal onClose={() => setShowCreate(false)} />}
      {editingStudentId && <EditStudentModal studentId={editingStudentId} onClose={() => setEditingStudentId(null)} />}

      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Bộ lọc Tìm kiếm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFilterOpen(false)}>Bỏ lọc</Button>
            <Button className="bg-[#4CAF50] hover:bg-[#388E3C] text-white" onClick={() => setIsFilterOpen(false)}>Áp dụng</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Trạng thái học tập</label>
            <Select 
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'ACTIVE', label: 'Đang học' },
                { value: 'INACTIVE', label: 'Bảo lưu / Đã nghỉ' }
              ]}
              placeholder="Chọn trạng thái..."
              className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}
