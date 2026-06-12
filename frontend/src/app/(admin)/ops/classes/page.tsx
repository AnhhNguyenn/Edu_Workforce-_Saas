'use client';

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateButton } from '@/components/ui/create-button';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass, useClassDetails, useClassStudents } from "@/hooks/queries/useClasses";
import { useSchools } from "@/hooks/queries/useSchools";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
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

  const [newClass, setNewClass] = useState({ name: '', schoolId: '', description: '' });
  const [editClass, setEditClass] = useState({ name: '', schoolId: '', description: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSchoolId, setFilterSchoolId] = useState<string>('');

  const { data: classes, isLoading, isError } = useClasses(debouncedSearch, filterSchoolId);
  const { data: schools } = useSchools();
  const { data: profile } = useProfile();
  const isAuthorized = profile?.role === 'SUPER_ADMIN' || profile?.role === 'CENTER_ADMIN';
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  
  const { data: classDetails, isLoading: isDetailsLoading } = useClassDetails(detailClassId);
  const { data: classStudents, isLoading: isStudentsLoading } = useClassStudents(detailClassId);

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

  const handleCreate = async () => {
    if (!newClass.name || !newClass.schoolId) {
      toast.error('Vui lòng nhập tên lớp và chọn cơ sở');
      return;
    }
    try {
      await createClass.mutateAsync({
        name: newClass.name,
        schoolId: newClass.schoolId,
        description: newClass.description || undefined
      });
      toast.success('Mở lớp thành công!');
      setIsCreateOpen(false);
      setNewClass({ name: '', schoolId: '', description: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi mở lớp');
      console.error("Failed to create class", error);
    }
  };

  const handleEdit = async () => {
    if (!selectedClass || !editClass.name || !editClass.schoolId) {
      toast.error('Vui lòng nhập tên lớp và chọn cơ sở');
      return;
    }
    try {
      await updateClass.mutateAsync({
        id: selectedClass.id,
        data: {
          name: editClass.name,
          schoolId: editClass.schoolId,
          description: editClass.description || undefined
        }
      });
      toast.success('Sửa thông tin lớp thành công!');
      setIsEditOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi sửa lớp');
      console.error("Failed to update class", error);
    }
  };

  const openEditModal = (cls: any) => {
    setSelectedClass(cls);
    setEditClass({
      name: cls.name || '',
      schoolId: cls.schoolId || '',
      description: cls.classDetail?.description || ''
    });
    setIsEditOpen(true);
  };

  const openDetailModal = (classId: string) => {
    setDetailClassId(classId);
    setIsDetailOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Quản lý lớp học</h2>
          <p className="text-edu-muted text-sm">Danh sách các lớp học đang vận hành tại trung tâm</p>
        </div>
        {isAuthorized && (
          <CreateButton onClick={() => setIsCreateOpen(true)} label="Mở lớp mới" />
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border gap-4">
          <h3 className="text-base font-semibold text-edu-fg flex items-center gap-2">
            Danh sách Lớp
            <Badge className="bg-[#E8F5E9] text-[#2E7D32]">{classes?.totalCount || 0}</Badge>
          </h3>
          <div className="flex flex-1 max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
              <Input 
                placeholder="Tìm mã lớp, tên lớp..." 
                className="pl-9 h-9 text-sm focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant={filterSchoolId ? "primary" : "secondary"} size="icon" className="h-9 w-9" onClick={() => setIsFilterOpen(true)}>
              <Filter size={16} />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
           <div className="p-10 text-center text-edu-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu lớp học...</div>
        ) : isError ? (
           <div className="p-10 text-center text-edu-danger">Lỗi kết nối API.</div>
        ) : !classes?.items || classes.items.length === 0 ? (
           <EmptyState 
             hasFilter={!!searchTerm || !!filterSchoolId}
             onClearFilter={() => { setSearchTerm(''); setFilterSchoolId(''); }}
             description="Không có lớp học nào."
           />
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full whitespace-nowrap">
              <TableHeader>
              <TableRow>
                <TableHead>Mã Lớp</TableHead>
                <TableHead>Tên Lớp</TableHead>
                <TableHead>Giáo viên phụ trách</TableHead>
                <TableHead>Lịch học</TableHead>
                <TableHead>Học viên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.items.map((c) => (
                <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-semibold text-edu-fg">{c.id.substring(0, 8)}...</TableCell>
                  <TableCell className="font-semibold text-[#2E7D32] truncate max-w-[200px]" title={c.name}>{c.name}</TableCell>
                  <TableCell>{c.teacherName ?? 'Chưa phân công'}</TableCell>
                  <TableCell className="text-edu-muted text-sm">{c.schedule || 'Chưa xếp lịch'}</TableCell>
                  <TableCell>{c.studentsCount || 0}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === 'active' ? 'success' : 'warn'}>
                      {c.status === 'active' ? 'Đang học' : 'Sắp khai giảng'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end items-center">
                      <Button variant="secondary" size="sm" onClick={() => openDetailModal(c.id)} className="hover:border-[#4CAF50] hover:text-[#4CAF50]">Chi tiết</Button>
                      {isAuthorized && (
                        <ActionButtons
                          onEdit={() => openEditModal(c)}
                          onDelete={() => handleDeleteClick(c.id)}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </div>

      <Modal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        title="Mở lớp mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
            <Button 
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white gap-2" 
              onClick={handleCreate}
              disabled={createClass.isPending}
            >
              {createClass.isPending && <Loader2 size={16} className="animate-spin" />}
              {createClass.isPending ? 'Đang tạo...' : 'Tạo lớp'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Tên lớp học</label>
            <Input 
              placeholder="Nhập tên lớp..." 
              className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
              value={newClass.name}
              onChange={(e) => setNewClass({...newClass, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Cơ sở trực thuộc</label>
              <Select 
                options={schools?.items?.map(s => ({ value: s.id, label: s.name })) || []}
                placeholder="Chọn cơ sở..."
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30"
                value={newClass.schoolId}
                onChange={(val) => setNewClass({...newClass, schoolId: val})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Mô tả thêm</label>
              <Input 
                placeholder="Lớp tiếng Anh..." 
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={newClass.description}
                onChange={(e) => setNewClass({...newClass, description: e.target.value})}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        title="Sửa thông tin lớp học"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button 
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white gap-2" 
              onClick={handleEdit}
              disabled={updateClass.isPending}
            >
              {updateClass.isPending && <Loader2 size={16} className="animate-spin" />}
              {updateClass.isPending ? 'Đang lưu...' : 'Lưu lớp'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Tên lớp học</label>
            <Input 
              placeholder="Nhập tên lớp..." 
              className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
              value={editClass.name}
              onChange={(e) => setEditClass({...editClass, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Cơ sở trực thuộc</label>
              <Select 
                options={schools?.items?.map(s => ({ value: s.id, label: s.name })) || []}
                placeholder="Chọn cơ sở..."
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30"
                value={editClass.schoolId}
                onChange={(val) => setEditClass({...editClass, schoolId: val})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Mô tả thêm</label>
              <Input 
                placeholder="Lớp tiếng Anh..." 
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={editClass.description}
                onChange={(e) => setEditClass({...editClass, description: e.target.value})}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* FILTER MODAL */}
      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Bộ lọc Tìm kiếm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setFilterSchoolId(''); setIsFilterOpen(false); }}>Bỏ lọc</Button>
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
        </div>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setDetailClassId(null); }}
        title="Chi tiết lớp học"
        footer={
          <Button variant="secondary" onClick={() => { setIsDetailOpen(false); setDetailClassId(null); }}>Đóng</Button>
        }
      >
        {isDetailsLoading ? (
          <div className="py-10 text-center"><Loader2 className="animate-spin inline mr-2 text-edu-accent" /> Đang tải thông tin...</div>
        ) : classDetails ? (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-lg font-bold text-edu-fg mb-3">{classDetails.name}</h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs">Mã lớp</span>
                  <span className="font-mono font-medium">{classDetails.id.substring(0, 8)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Giáo viên phụ trách</span>
                  <span className="font-medium">{classDetails.teacherName || 'Chưa phân công'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Lịch học</span>
                  <span className="font-medium">{classDetails.schedule || 'Chưa xếp lịch'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Trạng thái</span>
                  <Badge variant={classDetails.status === 'active' ? 'success' : 'warn'} className="mt-1">
                    {classDetails.status === 'active' ? 'Đang học' : 'Sắp khai giảng'}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-edu-fg mb-3 flex justify-between items-center">
                Danh sách học viên
                <Badge variant="secondary">{classStudents?.length || 0} / {classDetails.maxStudents || 0}</Badge>
              </h4>
              {isStudentsLoading ? (
                <div className="py-4 text-center text-sm text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Đang tải...</div>
              ) : classStudents && classStudents.length > 0 ? (
                <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                  <Table className="whitespace-nowrap text-sm">
                    <TableHeader className="bg-gray-50 sticky top-0">
                      <TableRow>
                        <TableHead>Mã HV</TableHead>
                        <TableHead>Họ Tên</TableHead>
                        <TableHead>SĐT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classStudents.map((student: any) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono text-xs">{student.id.substring(0, 6)}</TableCell>
                          <TableCell className="font-medium">{student.fullName}</TableCell>
                          <TableCell>{student.phone || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  Lớp học này chưa có học viên nào.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-red-500">Không tìm thấy thông tin lớp học.</div>
        )}
      </Modal>

    </div>
  );
}
