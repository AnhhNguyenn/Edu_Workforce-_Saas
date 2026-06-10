'use client';

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass } from "@/hooks/queries/useClasses";
import { useSchools } from "@/hooks/queries/useSchools";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function ClassesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const [newClass, setNewClass] = useState({ name: '', schoolId: '', description: '' });
  const [editClass, setEditClass] = useState({ name: '', schoolId: '', description: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: classes, isLoading, isError } = useClasses(debouncedSearch);
  const { data: schools } = useSchools();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      try {
        await deleteClass.mutateAsync(id);
        toast.success('Đã xóa lớp học!');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa lớp');
      }
    }
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

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Quản lý lớp học</h2>
          <p className="text-edu-muted text-sm">Danh sách các lớp học đang vận hành tại trung tâm</p>
        </div>
        <Button className="gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white" onClick={() => setIsCreateOpen(true)}>
          <Plus size={18} />
          Mở lớp mới
        </Button>
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
            <Button variant="secondary" size="icon" className="h-9 w-9">
              <Filter size={16} />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
           <div className="p-10 text-center text-edu-muted">Đang tải dữ liệu lớp học...</div>
        ) : isError ? (
           <div className="p-10 text-center text-edu-danger">Lỗi kết nối API.</div>
        ) : !classes?.items || classes.items.length === 0 ? (
           <div className="p-10 text-center text-edu-muted">Chưa có lớp học nào.</div>
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
                  <TableCell className="font-semibold text-[#2E7D32]">{c.name}</TableCell>
                  <TableCell>{c.teacherName || 'Chưa phân công'}</TableCell>
                  <TableCell className="text-edu-muted text-sm">{c.schedule || 'Chưa xếp lịch'}</TableCell>
                  <TableCell>{c.studentsCount || 0}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === 'active' ? 'success' : 'warn'}>
                      {c.status === 'active' ? 'Đang học' : 'Sắp khai giảng'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" className="hover:border-[#4CAF50] hover:text-[#4CAF50]">Chi tiết</Button>
                      <Button variant="outline" size="sm" onClick={() => openEditModal(c)}>Sửa</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}>Xóa</Button>
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
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white" 
              onClick={handleCreate}
              disabled={createClass.isPending}
            >
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
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white" 
              onClick={handleEdit}
              disabled={updateClass.isPending}
            >
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
    </div>
  );
}
