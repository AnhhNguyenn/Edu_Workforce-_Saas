'use client';

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useClasses } from "@/hooks/queries/useClasses";

export default function ClassesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: classes, isLoading, isError } = useClasses();

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
            <Badge className="bg-[#E8F5E9] text-[#2E7D32]">{classes?.length || 0}</Badge>
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
              {classes?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-edu-fg">{c.id}</TableCell>
                  <TableCell className="font-semibold text-[#2E7D32]">{c.name}</TableCell>
                  <TableCell>{c.teacherName}</TableCell>
                  <TableCell className="text-edu-muted text-sm">{c.schedule}</TableCell>
                  <TableCell>{c.studentsCount}</TableCell>
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
            <Button className="bg-[#4CAF50] hover:bg-[#388E3C] text-white" onClick={() => setIsCreateOpen(false)}>Tạo lớp</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Tên lớp học</label>
            <Input placeholder="Nhập tên lớp..." className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Giáo viên phụ trách</label>
              <Select 
                options={[
                  { value: 'nguyen-van-a', label: 'Nguyễn Văn A' },
                  { value: 'tran-thi-b', label: 'Trần Thị B' }
                ]}
                placeholder="Chọn giáo viên..."
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Sĩ số tối đa</label>
              <Input type="number" placeholder="20" className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
