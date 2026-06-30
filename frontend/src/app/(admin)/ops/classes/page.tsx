'use client';

import { useState } from "react";
import { Search, Filter, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateButton } from '@/components/ui/create-button';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useClasses, useDeleteClass } from "@/hooks/queries/useClasses";
import { useSchools } from "@/hooks/queries/useSchools";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import CreateClassModal from './_components/CreateClassModal';
import EditClassModal from './_components/EditClassModal';
import ViewClassModal from './_components/ViewClassModal';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { useProfile } from '@/hooks/queries/useProfile';
import { useDebounce } from '@/hooks/useDebounce';
import { EmptyState } from '@/components/ui/EmptyState';
import { useConfirm } from '@/providers/ConfirmProvider';
import { Loader2 } from 'lucide-react';

export default function ClassesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailClassId, setDetailClassId] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const { confirm } = useConfirm();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSchoolId, setFilterSchoolId] = useState<string>('');
  const [filterAcademicYear, setFilterAcademicYear] = useState<string>('');

  const { data: classes, isLoading, isError } = useClasses(debouncedSearch, filterSchoolId, filterAcademicYear);
  const { data: schools } = useSchools();
  const { data: profile } = useProfile();
  const isAuthorized = profile?.role === 'SUPER_ADMIN' || profile?.role === 'CENTER_ADMIN';
  const deleteClass = useDeleteClass();

  const handleDeleteClick = (classId: string) => {
    confirm({
      title: "Xóa Lớp học",
      description: "Bạn có chắc chắn muốn xóa lớp học này không? Mọi dữ liệu về học sinh và điểm danh thuộc lớp này có thể bị ảnh hưởng.",
      requireInput: true,
      expectedInput: "XAC NHAN",
      action: async () => {
        try {
          await deleteClass.mutateAsync(classId);
          toast.success('Đã xóa lớp học!');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Lỗi khi xóa lớp');
        }
      }
    });
  };


  const openEditModal = (cls: any) => {
    setSelectedClass(cls);
    setIsEditOpen(true);
  };

  const openDetailModal = (classId: string) => {
    setDetailClassId(classId);
    setIsDetailOpen(true);
  };

  return (
    <div className="w-full h-full space-y-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Quản lý lớp học</h2>
          <p className="text-edu-muted text-sm">Danh sách các lớp học đang vận hành tại trung tâm</p>
        </div>
        {isAuthorized && (
          <div className="w-full sm:w-auto">
            <CreateButton onClick={() => setIsCreateOpen(true)} label="Mở lớp mới" className="w-full sm:w-auto" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-edu-border gap-4">
          <h3 className="text-base font-semibold text-edu-fg flex items-center gap-2">
            Danh sách Lớp
            <Badge className="bg-[#E8F5E9] text-[#2E7D32]">{classes?.totalCount || 0}</Badge>
          </h3>
          <div className="flex flex-1 w-full md:max-w-md gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
              <Input 
                placeholder="Tìm mã lớp, tên lớp..." 
                className="pl-9 h-10 sm:h-9 text-sm focus:border-[#4CAF50] focus:ring-[#4CAF50]/30 w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant={filterSchoolId ? "primary" : "secondary"} size="icon" className="h-10 w-10 sm:h-9 sm:w-9 shrink-0" onClick={() => setIsFilterOpen(true)}>
              <Filter size={16} />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
           <div className="p-10 text-center text-edu-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu lớp học...</div>
        ) : isError ? (
           <ApiErrorState onRetry={() => window.location.reload()} />
        ) : !classes?.items || classes.items.length === 0 ? (
           <EmptyState 
             icon={<BookOpen size={32} />}
             title="Chưa có lớp học"
             hasFilter={!!searchTerm || !!filterSchoolId}
             onClearFilter={() => { setSearchTerm(''); setFilterSchoolId(''); }}
             description="Không có lớp học nào phù hợp với tìm kiếm."
           />
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full whitespace-nowrap">
              <TableHeader>
              <TableRow>
                <TableHead>Tên Lớp</TableHead>
                <TableHead>Cơ sở</TableHead>
                <TableHead>Niên khóa</TableHead>
                <TableHead>Học viên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.items.map((c) => (
                <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-semibold text-[#2E7D32] truncate max-w-[200px]" title={c.name}>{c.name}</TableCell>
                  <TableCell className="text-gray-600">{c.schoolName || '-'}</TableCell>
                  <TableCell className="font-medium">{c.academicYear || '-'}</TableCell>
                  <TableCell>{c.studentsCount || 0}</TableCell>
                  <TableCell>
                    <Badge variant={c.statusCode === 'ACTIVE' ? 'success' : 'warn'}>
                      {c.statusCode === 'ACTIVE' ? 'Đang học' : 'Sắp khai giảng'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <ActionButtons
                        onView={() => openDetailModal(c.id)}
                        onEdit={isAuthorized ? () => openEditModal(c) : undefined}
                        onDelete={isAuthorized ? () => handleDeleteClick(c.id) : undefined}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </div>

      {isCreateOpen && (
        <CreateClassModal onClose={() => setIsCreateOpen(false)} />
      )}

      {isEditOpen && selectedClass && (
        <EditClassModal 
          initialData={selectedClass} 
          onClose={() => { setIsEditOpen(false); setSelectedClass(null); }} 
        />
      )}

      {/* FILTER MODAL */}
      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Bộ lọc Tìm kiếm"
        overflowVisible={true}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setFilterSchoolId(''); setFilterAcademicYear(''); setIsFilterOpen(false); }}>Bỏ lọc</Button>
            <Button className="bg-[#4CAF50] hover:bg-[#388E3C] text-white" onClick={() => setIsFilterOpen(false)}>Áp dụng</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Cơ sở trực thuộc</label>
            <Select 
              options={schools?.items?.map(s => ({ value: s.id, label: s.name })) || []}
              placeholder="Chọn cơ sở để lọc..."
              className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30"
              value={filterSchoolId}
              onChange={(val) => setFilterSchoolId(val)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Niên khóa</label>
            <Input 
              placeholder="Nhập niên khóa cần tìm..."
              className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30"
              value={filterAcademicYear}
              onChange={(e) => setFilterAcademicYear(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {isDetailOpen && detailClassId && (
        <ViewClassModal 
          classId={detailClassId} 
          onClose={() => { setIsDetailOpen(false); setDetailClassId(null); }} 
        />
      )}

    </div>
  );
}
