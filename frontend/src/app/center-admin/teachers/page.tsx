'use client';

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getAvatarInitials, VIETNAMESE_TEACHERS } from "@/lib/mock-data";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";

export default function TeachersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Giáo viên & Trợ giảng</h2>
          <p className="text-edu-muted text-sm">Quản lý nhân sự giảng dạy trực thuộc trung tâm</p>
        </div>
        <Button className="gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white" onClick={() => setIsCreateOpen(true)}>
          <Plus size={18} />
          Thêm nhân sự
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border gap-4">
          <h3 className="text-base font-semibold text-edu-fg flex items-center gap-2">
            Danh sách nhân sự
            <Badge className="bg-[#E8F5E9] text-[#2E7D32]">{VIETNAMESE_TEACHERS.length}</Badge>
          </h3>
          <div className="flex flex-1 max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
              <Input placeholder="Tìm tên giáo viên..." className="pl-9 h-9 text-sm focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" />
            </div>
            <Button variant="secondary" size="icon" className="h-9 w-9">
              <Filter size={16} />
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ và Tên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Tỷ lệ điểm danh</TableHead>
              <TableHead>Số ca dạy (Tháng)</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {VIETNAMESE_TEACHERS.map((t, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] font-bold text-xs">
                      {getAvatarInitials(t.name)}
                    </div>
                    <div className="font-semibold text-edu-fg">{t.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={t.role === 'teacher' ? 'info' : 'muted'}>
                    {t.role === 'teacher' ? 'Giáo viên' : 'Trợ giảng'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-24">
                       <div className="h-full bg-[#4CAF50]" style={{ width: `\${t.attendance}%` }}></div>
                    </div>
                    <span className="text-xs font-semibold">{t.attendance}%</span>
                  </div>
                </TableCell>
                <TableCell>{t.sessions} ca</TableCell>
                <TableCell>
                  <Badge variant={t.status === 'active' ? 'success' : t.status === 'on_leave' ? 'warn' : 'danger'}>
                    {t.status === 'active' ? 'Đang làm' : t.status === 'on_leave' ? 'Nghỉ phép' : 'Đã nghỉ'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="secondary" size="sm" className="hover:border-[#4CAF50] hover:text-[#4CAF50]">Hồ sơ</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        title="Thêm nhân sự mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
            <Button className="bg-[#4CAF50] hover:bg-[#388E3C] text-white" onClick={() => setIsCreateOpen(false)}>Tạo tài khoản</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Họ tên</label>
              <Input placeholder="Nhập tên giáo viên..." className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Email</label>
              <Input type="email" placeholder="gv@domain.com" className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Vai trò</label>
            <Select 
              options={[
                { value: 'teacher', label: 'Giáo viên' },
                { value: 'assistant', label: 'Trợ giảng' }
              ]}
              placeholder="Chọn vai trò..."
              className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

