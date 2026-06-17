'use client';

import { useState } from "react";
import { Search, Filter, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateButton } from '@/components/ui/create-button';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getAvatarInitials } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useUsers, useCreateUser, useUpdateUser, useLockUser, useUnlockUser, useDeleteUser, UserDto } from "@/hooks/queries/useUsers";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useDebounce } from '@/hooks/useDebounce';
import { useProfile } from '@/hooks/queries/useProfile';
import { EmptyState } from '@/components/ui/EmptyState';
import { useConfirm } from '@/providers/ConfirmProvider';
import { Loader2 } from 'lucide-react';

export default function TeachersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const { confirm } = useConfirm();

  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', phone: '', roleCode: 'TEACHER' });
  const [editUser, setEditUser] = useState({ fullName: '', roleCode: 'TEACHER', email: '', phone: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [roleFilter, setRoleFilter] = useState<string | undefined>('TEACHER');

  const { data: users, isLoading } = useUsers(roleFilter, debouncedSearch);
  const { data: profile } = useProfile();
  const isAuthorized = profile?.role === 'SUPER_ADMIN' || profile?.role === 'CENTER_ADMIN';

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const lockUser = useLockUser();
  const unlockUser = useUnlockUser();
  const deleteUser = useDeleteUser();

  const handleCreate = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.password || !newUser.roleCode) return;
    try {
      const payload = {
        fullName: newUser.fullName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.roleCode,
        phone: newUser.phone
      };
      await createUser.mutateAsync(payload);
      setIsCreateOpen(false);
      setNewUser({ fullName: '', email: '', password: '', phone: '', roleCode: 'TEACHER' });
      toast.success("Tạo nhân sự thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi tạo nhân sự");
    }
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    try {
      const payload = {
        fullName: editUser.fullName,
        email: selectedUser.email,
        phone: editUser.phone,
        role: editUser.roleCode
      };
      await updateUser.mutateAsync({ id: selectedUser.id, data: payload });
      setIsEditOpen(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật nhân sự");
    }
  };

  const openEditModal = (user: UserDto) => {
    setSelectedUser(user);
    setEditUser({ 
      fullName: user.fullName || '', 
      roleCode: user.roleCode || 'TEACHER',
      email: user.email || '',
      phone: user.phone || '' 
    });
    setIsEditOpen(true);
  };

  const handleToggleStatusClick = (user: UserDto) => {
    const isLocking = user.statusCode === 'ACTIVE' || user.status === 'ACTIVE';
    confirm({
      title: isLocking ? "Khóa tài khoản" : "Mở khóa tài khoản",
      description: isLocking 
        ? `Bạn có chắc chắn muốn khóa nhân sự này? Họ sẽ không thể đăng nhập vào hệ thống.` 
        : `Bạn có chắc chắn muốn mở khóa cho nhân sự này?`,
      requireInput: false,
      action: async () => {
        try {
          if (isLocking) {
            await lockUser.mutateAsync({ id: user.id, lockEndAt: null });
            toast.success("Đã khóa nhân sự!");
          } else {
            await unlockUser.mutateAsync(user.id);
            toast.success("Đã mở khóa nhân sự!");
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Lỗi thao tác");
        }
      }
    });
  };

  const handleDeleteClick = (user: UserDto) => {
    confirm({
      title: "Xóa nhân sự",
      description: `Bạn có chắc chắn muốn xóa nhân sự ${user.fullName}?`,
      requireInput: false,
      action: async () => {
        try {
          await deleteUser.mutateAsync(user.id);
          toast.success("Đã xóa nhân sự thành công!");
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Lỗi xóa nhân sự");
        }
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Giáo viên & Trợ giảng</h2>
          <p className="text-edu-muted text-sm">Quản lý nhân sự giảng dạy trực thuộc trung tâm</p>
        </div>
        {isAuthorized && (
          <div className="w-full sm:w-auto">
            <CreateButton onClick={() => setIsCreateOpen(true)} label="Thêm nhân sự" className="w-full sm:w-auto" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between md:items-center border-b border-edu-border gap-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <h3 className="text-base font-semibold text-edu-fg flex items-center gap-2">
              Danh sách nhân sự
              <Badge className="bg-[#E8F5E9] text-[#2E7D32]">{users?.totalCount || 0}</Badge>
            </h3>
            <div className="flex gap-2 items-center pl-0 sm:pl-4 sm:border-l border-edu-border">
            <Button 
              variant={roleFilter === 'TEACHER' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setRoleFilter('TEACHER')}
              className={roleFilter === 'TEACHER' ? 'bg-[#4CAF50] text-white hover:bg-[#388E3C]' : ''}
            >
              Giáo viên
            </Button>
            <Button 
              variant={roleFilter === 'ASSISTANT' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setRoleFilter('ASSISTANT')}
              className={roleFilter === 'ASSISTANT' ? 'bg-[#4CAF50] text-white hover:bg-[#388E3C]' : ''}
            >
              Trợ giảng
            </Button>
            </div>
          </div>
          <div className="flex flex-1 w-full md:max-w-md gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
              <Input 
                placeholder="Tìm tên nhân sự..." 
                className="pl-9 h-10 sm:h-9 text-sm focus:border-[#4CAF50] focus:ring-[#4CAF50]/30 w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="secondary" size="icon" className="h-10 w-10 sm:h-9 sm:w-9 shrink-0">
              <Filter size={16} />
            </Button>
          </div>
        </div>
        
        {(!users?.items || users.items.length === 0) && !isLoading ? (
          <EmptyState 
            icon={<UserX size={32} />}
            title={searchTerm ? "Không tìm thấy kết quả" : "Chưa có nhân sự"}
            hasFilter={!!searchTerm}
            onClearFilter={() => { setSearchTerm(''); }}
            description={searchTerm ? "Không có giáo viên/trợ giảng nào phù hợp với từ khóa." : "Chưa có giáo viên hoặc trợ giảng nào trong hệ thống."}
          />
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full whitespace-nowrap">
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
              <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] font-bold text-xs shrink-0">
                      {getAvatarInitials(t.fullName ?? 'U')}
                    </div>
                    <div className="font-semibold text-edu-fg" title={t.fullName}>{t.fullName ?? 'Chưa cập nhật'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={t.roleCode === 'TEACHER' ? 'info' : 'muted'}>
                    {t.roleCode === 'TEACHER' ? 'Giáo viên' : 'Trợ giảng'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-edu-muted" title={t.email}>{t.email ?? 'Chưa cập nhật'}</TableCell>
                <TableCell>
                  <Badge variant={(t.statusCode === 'ACTIVE' || t.status === 'ACTIVE') ? 'success' : (t.statusCode === 'INACTIVE' || t.status === 'INACTIVE') ? 'danger' : 'warn'}>
                    {(t.statusCode === 'ACTIVE' || t.status === 'ACTIVE') ? 'Đang làm' : 'Đã nghỉ'}
                  </Badge>
                </TableCell>
                  <TableCell>
                    {isAuthorized && (
                      <ActionButtons
                        onEdit={() => openEditModal(t)}
                        onToggleStatus={() => handleToggleStatusClick(t)}
                        onDelete={() => handleDeleteClick(t)}
                        isLocked={!(t.statusCode === 'ACTIVE' || t.status === 'ACTIVE')}
                      />
                    )}
                  </TableCell>
              </TableRow>
            ))}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-edu-muted">
                  <Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
        )}
      </div>

      <Modal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        title="Thêm nhân sự mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
            <Button 
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white gap-2" 
              onClick={handleCreate}
              disabled={createUser.isPending}
            >
              {createUser.isPending && <Loader2 size={16} className="animate-spin" />}
              {createUser.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Mật khẩu khởi tạo</label>
              <Input 
                type="password"
                placeholder="••••••••" 
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Số điện thoại</label>
              <Input 
                placeholder="09xxxx" 
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
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

      {/* EDIT MODAL */}
      <Modal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        title="Sửa thông tin nhân sự"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button 
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white gap-2" 
              onClick={handleEdit}
              disabled={updateUser.isPending}
            >
              {updateUser.isPending && <Loader2 size={16} className="animate-spin" />}
              {updateUser.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Họ tên</label>
              <Input 
                placeholder="Nhập tên giáo viên..." 
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={editUser.fullName}
                onChange={(e) => setEditUser({...editUser, fullName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Email (Không thể sửa)</label>
              <Input 
                type="email" 
                disabled
                className="bg-gray-100" 
                value={selectedUser?.email || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Số điện thoại</label>
              <Input 
                placeholder="Nhập SĐT..." 
                className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" 
                value={editUser.phone}
                onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
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
              value={editUser.roleCode}
              onChange={(val) => setEditUser({...editUser, roleCode: val})}
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}

