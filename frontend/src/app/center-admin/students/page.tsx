'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useStudents, useExportStudents, useImportStudents, useDeleteStudent } from '@/hooks/queries/useStudents';
import { useDebounce } from '@/hooks/useDebounce';
import { StudentTable } from './_components/StudentTable';
import { StudentToolbar } from './_components/StudentToolbar';

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
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data = {}, isLoading } = useStudents(debouncedSearch);
  const students = data.items || [];

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
    } catch (err) {
      alert('Lỗi xuất file');
    }
  };

  const handleImport = async (file: File) => {
    try {
      await importMutation.mutateAsync(file);
      alert('Nhập file thành công!');
    } catch (err) {
      alert('Lỗi nhập file. Vui lòng kiểm tra định dạng .xlsx');
    }
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
      />
      <StudentTable 
        students={students} 
        isLoading={isLoading} 
        onEdit={(student) => setEditingStudentId(student.id)}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      {showCreate && <CreateStudentModal onClose={() => setShowCreate(false)} />}
      {editingStudentId && <EditStudentModal studentId={editingStudentId} onClose={() => setEditingStudentId(null)} />}
    </div>
  );
}
