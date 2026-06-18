'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useStudents, useExportStudents, useImportStudents, useDeleteStudent, useBulkAssignClass } from '@/hooks/queries/useStudents';
import { useClasses } from '@/hooks/queries/useClasses';
import { useDebounce } from '@/hooks/useDebounce';
import { StudentTable } from './_components/StudentTable';
import { StudentToolbar } from './_components/StudentToolbar';
import { toast } from 'react-hot-toast';
import { useProfile } from '@/hooks/queries/useProfile';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/providers/ConfirmProvider';
import { Users, Loader2 } from 'lucide-react';

// Áp dụng Lazy Load cho Modal
const CreateStudentModal = dynamic(() => import('./_components/CreateStudentModal'), { 
  ssr: false,
  loading: () => null 
});

const EditStudentModal = dynamic(() => import('./_components/EditStudentModal'), { 
  ssr: false,
  loading: () => null 
});

const ViewStudentModal = dynamic(() => import('./_components/ViewStudentModal'), { 
  ssr: false,
  loading: () => null 
});

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  
  const { confirm } = useConfirm();
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data = {}, isLoading } = useStudents(debouncedSearch);
  const students = data.items || [];
  const { data: classesData } = useClasses('', '');

  const { data: profile } = useProfile();
  const isAuthorized = profile?.role === 'SUPER_ADMIN' || profile?.role === 'CENTER_ADMIN';

  const exportMutation = useExportStudents();
  const importMutation = useImportStudents();
  const deleteMutation = useDeleteStudent();
  const bulkAssignMutation = useBulkAssignClass();

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
          setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Lỗi xóa học viên");
        }
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(students.map((s: any) => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectRow = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(prev => [...prev, studentId]);
    } else {
      setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedClassId) {
      toast.error('Vui lòng chọn một lớp học');
      return;
    }
    try {
      await bulkAssignMutation.mutateAsync({ studentIds: selectedStudentIds, classId: selectedClassId });
      toast.success(`Đã xếp ${selectedStudentIds.length} học viên vào lớp thành công!`);
      setShowBulkAssign(false);
      setSelectedStudentIds([]);
      setSelectedClassId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi xếp lớp hàng loạt');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7 relative pb-20">
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
        onView={(student) => setViewingStudentId(student.id)}
        onEdit={(student) => setEditingStudentId(student.id)}
        onDelete={handleDeleteClick}
        isAuthorized={isAuthorized}
        selectedIds={selectedStudentIds}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
      />

      {selectedStudentIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-6 py-4 rounded-full shadow-2xl border border-edu-border flex items-center space-x-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center text-sm font-semibold text-edu-fg">
            <div className="w-6 h-6 bg-[#EFF6FF] text-[#1D4ED8] rounded-full flex items-center justify-center mr-2">
              {selectedStudentIds.length}
            </div>
            học viên được chọn
          </div>
          <div className="h-6 w-px bg-gray-200"></div>
          <Button 
            onClick={() => setShowBulkAssign(true)} 
            className="bg-white text-[#2563EB] border border-gray-200 hover:border-[#2563EB] hover:bg-blue-50 active:scale-95 transition-all shadow-md"
          >
            <Users className="w-4 h-4 mr-2" /> Xếp lớp hàng loạt
          </Button>
          <button 
            onClick={() => setSelectedStudentIds([])}
            className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {showCreate && <CreateStudentModal onClose={() => setShowCreate(false)} />}
      {editingStudentId && <EditStudentModal studentId={editingStudentId} onClose={() => setEditingStudentId(null)} />}
      {viewingStudentId && <ViewStudentModal studentId={viewingStudentId} onClose={() => setViewingStudentId(null)} />}

      <Modal
        isOpen={showBulkAssign}
        onClose={() => setShowBulkAssign(false)}
        title="Xếp lớp hàng loạt"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowBulkAssign(false)}>Hủy</Button>
            <Button 
              onClick={handleBulkAssign} 
              disabled={bulkAssignMutation.isPending || !selectedClassId}
              className="bg-white text-[#2563EB] border border-gray-200 hover:border-[#2563EB] hover:bg-blue-50 active:scale-95 transition-all"
            >
              {bulkAssignMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...</> : 'Xác nhận xếp lớp'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="bg-[#EFF6FF] text-[#1E40AF] p-3 rounded-lg text-sm mb-4 border border-[#DBEAFE] flex items-start">
            <Users className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>Bạn đang chọn xếp lớp cho <strong>{selectedStudentIds.length}</strong> học viên. Các học viên này sẽ được cập nhật trạng thái Lớp học mới nhất.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Chọn Lớp học đích <span className="text-red-500">*</span></label>
            <Select 
              options={classesData?.items?.map((c: any) => ({ value: c.id, label: c.name })) || []}
              value={selectedClassId}
              onChange={setSelectedClassId}
              placeholder="Chọn lớp học..."
              className="w-full"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Bộ lọc Tìm kiếm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFilterOpen(false)}>Bỏ lọc</Button>
            <Button className="bg-white text-[#2563EB] border border-gray-200 hover:border-[#2563EB] hover:bg-blue-50 active:scale-95 transition-all" onClick={() => setIsFilterOpen(false)}>Áp dụng</Button>
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
              className="focus:border-[#2563EB] focus:ring-[#2563EB]/30"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}
