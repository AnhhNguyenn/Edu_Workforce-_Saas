'use client';

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getAvatarInitials } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useUsers, useCreateUser } from "@/hooks/queries/useUsers";

export default function TeachersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', email: '', roleCode: 'TEACHER' });
  const { data: users, isLoading } = useUsers('TEACHER');
  const createUser = useCreateUser();

  const handleCreate = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.roleCode) return;
    try {
      await createUser.mutateAsync(newUser);
      setIsCreateOpen(false);
      setNewUser({ fullName: '', email: '', roleCode: 'TEACHER' });
    } catch (error) {
      console.error("Failed to create user", error);
    }
  };

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
            <Badge className="bg-[#E8F5E9] text-[#2E7D32]">{users?.totalCount || 0}</Badge>
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
              <TableHead>Email</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.items?.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] font-bold text-xs">
                      {getAvatarInitials(t.fullName)}
                    </div>
                    <div className="font-semibold text-edu-fg">{t.fullName}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={t.roleCode === 'TEACHER' ? 'info' : 'muted'}>
                    {t.roleCode === 'TEACHER' ? 'Giáo viên' : 'Trợ giảng'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-edu-muted">{t.email}</TableCell>
                <TableCell>
                  <Badge variant={t.statusCode === 'ACTIVE' ? 'success' : t.statusCode === 'INACTIVE' ? 'danger' : 'warn'}>
                    {t.statusCode === 'ACTIVE' ? 'Đang làm' : 'Đã nghỉ'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="secondary" size="sm" className="hover:border-[#4CAF50] hover:text-[#4CAF50]">Hồ sơ</Button>
                </TableCell>
              </TableRow>
            ))}
            {(!users?.items || users.items.length === 0) && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-edu-muted">
                  Chưa có nhân sự nào.
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-edu-muted">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            )}
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
            <Button 
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white" 
              onClick={handleCreate}
              disabled={createUser.isPending}
            >
              {createUser.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Họ tên</label>
              <Input 
                placeholder="Nhập tên giáo viên..." 
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={newUser.fullName}
                onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Email</label>
              <Input 
                type="email" 
                placeholder="gv@domain.com" 
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Vai trò</label>
            <Select 
              options={[
                { value: 'TEACHER', label: 'Giáo viên' },
                { value: 'ASSISTANT', label: 'Trợ giảng' }
              ]}
              placeholder="Chọn vai trò..."
              className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30"
              value={newUser.roleCode}
              onChange={(val) => setNewUser({...newUser, roleCode: val})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

