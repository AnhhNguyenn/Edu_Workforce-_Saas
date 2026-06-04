'use client';

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useClasses, useCreateClass } from "@/hooks/queries/useClasses";
import { useUsers } from "@/hooks/queries/useUsers";

export default function ClassesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', teacherId: '', maxStudents: 20 });
  const { data: classes, isLoading, isError } = useClasses();
  const { data: teachers } = useUsers('TEACHER');
  const createClass = useCreateClass();

  const handleCreate = async () => {
    if (!newClass.name) return;
    try {
      await createClass.mutateAsync({
        name: newClass.name,
        teacherId: newClass.teacherId || undefined,
        maxStudents: Number(newClass.maxStudents)
      });
      setIsCreateOpen(false);
      setNewClass({ name: '', teacherId: '', maxStudents: 20 });
    } catch (error) {
      console.error("Failed to create class", error);
    }
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
              <Input placeholder="Tìm mã lớp, tên lớp..." className="pl-9 h-9 text-sm focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" />
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
          <Table>
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
                <TableRow key={c.id}>
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
                    <Button variant="secondary" size="sm" className="hover:border-[#4CAF50] hover:text-[#4CAF50]">Chi tiết</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Giáo viên phụ trách</label>
              <Select 
                options={teachers?.items?.map(t => ({ value: t.id, label: t.fullName })) || []}
                placeholder="Chọn giáo viên..."
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30"
                value={newClass.teacherId}
                onChange={(val) => setNewClass({...newClass, teacherId: val})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Sĩ số tối đa</label>
              <Input 
                type="number" 
                placeholder="20" 
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={newClass.maxStudents}
                onChange={(e) => setNewClass({...newClass, maxStudents: Number(e.target.value)})}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
