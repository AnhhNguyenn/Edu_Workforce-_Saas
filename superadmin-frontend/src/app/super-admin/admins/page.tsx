'use client';

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateButton } from "@/components/ui/create-button";
import { ActionButtons } from "@/components/ui/action-buttons";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { getAvatarInitials } from "@/lib/utils";
import { useUsers, useDeleteUser, useLockUser, useUnlockUser, useCreateUser, useUpdateUser, UserDto } from "@/hooks/queries/useUsers";
import { useOrganizations } from "@/hooks/queries/useOrganizations";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useConfirm } from "@/providers/ConfirmProvider";

export default function AdminsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLockOpen, setIsLockOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [lockType, setLockType] = useState('permanent'); // 'permanent' or 'date'
  const [lockDate, setLockDate] = useState<Date | null>(null);
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // Empty means all roles (Super Admin and Center Admin)
  
  // Create & Edit form state
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', roleCode: 'SUPER_ADMIN', phone: '', organizationId: '' });
  const [editFormData, setEditFormData] = useState({ fullName: '', roleCode: 'SUPER_ADMIN', phone: '', organizationId: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Simple debounce for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: orgs } = useOrganizations();
  const { data: admins, isLoading, isError, error } = useUsers(roleFilter || 'SUPER_ADMIN,CENTER_ADMIN', debouncedSearch);
  
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const lockMutation = useLockUser();
  const unlockMutation = useUnlockUser();
  const { confirm } = useConfirm();

  const handleCreate = () => {
    if (!formData.fullName.trim()) return toast.error("Vui lòng nhập Họ tên");
    if (!formData.email.trim()) return toast.error("Vui lòng nhập Email");
    if (!formData.password.trim()) return toast.error("Vui lòng nhập Mật khẩu khởi tạo");
    if (!formData.phone.trim()) return toast.error("Vui lòng nhập Số điện thoại");
    if (formData.roleCode === 'CENTER_ADMIN' && !formData.organizationId) {
      return toast.error("Vui lòng chọn Trực thuộc Trung tâm");
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setFormData({ fullName: '', email: '', password: '', roleCode: 'SUPER_ADMIN', phone: '', organizationId: '' });
        toast.success("Tạo tài khoản thành công!");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Có lỗi xảy ra khi tạo tài khoản.");
      }
    });
  };

  const handleEdit = () => {
    if (selectedUser) {
      if (!editFormData.fullName.trim()) return toast.error("Vui lòng nhập Họ tên");
      if (!editFormData.phone.trim()) return toast.error("Vui lòng nhập Số điện thoại");
      if (editFormData.roleCode === 'CENTER_ADMIN' && !editFormData.organizationId) {
        return toast.error("Vui lòng chọn Trực thuộc Trung tâm");
      }

      const payload = {
        fullName: editFormData.fullName,
        email: selectedUser.email,
        phone: editFormData.phone,
        role: editFormData.roleCode,
        organizationId: editFormData.organizationId || null
      };

      updateMutation.mutate({ id: selectedUser.id, data: payload }, {
        onSuccess: () => {
          setIsEditOpen(false);
          toast.success("Cập nhật thành công!");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật.");
        }
      });
    }
  };

  const openEditModal = (user: UserDto) => {
    setSelectedUser(user);
    setEditFormData({
      fullName: user.fullName || '',
      roleCode: user.roleCode || user.role || 'SUPER_ADMIN',
      phone: user.phone || '', // Using phone from UserDto now
      organizationId: user.organizationId || ''
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (user: UserDto) => {
    confirm({
      title: "Xác nhận xóa Admin",
      description: `Bạn có chắc chắn muốn xóa tài khoản ${user.fullName} (${user.email}) không? Hành động này sẽ chuyển tài khoản vào trạng thái đã xóa.`,
      requireInput: true,
      expectedInput: "XAC NHAN",
      action: async () => {
        try {
          await deleteMutation.mutateAsync(user.id);
          toast.success("Đã xóa tài khoản.");
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Lỗi xóa tài khoản.");
        }
      }
    });
  };

  const handleLock = () => {
    if (selectedUser) {
      const lockEndAt = lockType === 'date' && lockDate ? lockDate.toISOString() : null;
      lockMutation.mutate({ id: selectedUser.id, lockEndAt }, {
        onSuccess: () => {
          setIsLockOpen(false);
          toast.success("Đã khóa tài khoản thành công!");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Có lỗi xảy ra khi khóa tài khoản.");
        }
      });
    }
  };

  const handleUnlock = (id: string) => {
    unlockMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Đã mở khóa tài khoản thành công!");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Có lỗi xảy ra khi mở khóa tài khoản.");
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Quản trị viên (Admins)</h2>
          <p className="text-edu-muted text-sm">Quản lý tài khoản Super Admin và Center Admin</p>
        </div>
        <CreateButton onClick={() => setIsCreateOpen(true)} label="Thêm Admin" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border gap-4">
          <h3 className="text-base font-semibold text-edu-fg flex items-center gap-2">
            Danh sách Admin
            <Badge variant="info">{admins?.totalCount || 0}</Badge>
          </h3>
          <div className="flex flex-1 max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
              <Input 
                placeholder="Tìm tên, email, sđt..." 
                className="pl-9 h-10 text-sm" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-[180px]">
              <Select 
                options={[
                  { value: '', label: 'Tất cả Vai trò' },
                  { value: 'SUPER_ADMIN', label: 'Super Admin' },
                  { value: 'CENTER_ADMIN', label: 'Center Admin' }
                ]}
                value={roleFilter}
                onChange={setRoleFilter}
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
           <div className="p-10 text-center text-edu-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu admin...</div>
        ) : isError ? (
           <div className="p-10 text-center text-edu-danger">
             Lỗi kết nối API.
             <pre className="text-xs text-left mt-4 text-gray-500 overflow-auto whitespace-pre-wrap">
               {error instanceof Error ? error.message : JSON.stringify(error)}
             </pre>
           </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Tài khoản</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trực thuộc</TableHead>
                <TableHead>Đăng nhập cuối</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState 
                      hasFilter={!!searchTerm || !!roleFilter}
                      onClearFilter={() => { setSearchTerm(''); setRoleFilter(''); }}
                      description="Không tìm thấy tài khoản quản trị nào."
                    />
                  </TableCell>
                </TableRow>
              ) : admins?.items?.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-edu-accentLighter flex items-center justify-center text-edu-accent font-bold text-xs shrink-0">
                        {getAvatarInitials(a.fullName || 'U')}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-edu-fg truncate max-w-[150px]" title={a.fullName}>{a.fullName ?? 'Chưa cập nhật'}</div>
                        <div className="text-xs text-edu-muted truncate max-w-[150px]" title={a.email}>{a.email ?? 'Chưa cập nhật'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.roleCode === 'SUPER_ADMIN' ? 'warn' : 'info'}>
                      {a.roleCode || a.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-edu-fgSecondary truncate max-w-[150px]" title={a.organizationName}>{a.organizationName || 'Tất cả'}</TableCell>
                  <TableCell className="text-edu-muted">{a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant={a.statusCode === 'ACTIVE' ? 'success' : 'danger'}>
                        {a.statusCode === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                      </Badge>
                      {a.statusCode === 'SUSPENDED' && a.lockEndAt && new Date(a.lockEndAt).getFullYear() < 9999 && (
                        <span className="text-[10px] text-edu-danger">Đến {new Date(a.lockEndAt).toLocaleDateString('vi-VN')}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ActionButtons
                      onEdit={() => openEditModal(a)}
                      onDelete={() => handleDeleteClick(a)}
                      onToggleStatus={a.statusCode === 'ACTIVE' ? () => { setSelectedUser(a); setIsLockOpen(true); } : () => handleUnlock(a.id)}
                      isLocked={a.statusCode !== 'ACTIVE'}
                    />
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
        title="Thêm quản trị viên mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white">
              {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Họ tên</label>
              <Input placeholder="Nhập tên admin..." value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Email</label>
              <Input type="email" placeholder="admin@domain.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Mật khẩu khởi tạo</label>
            <Input type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Vai trò</label>
              <Select 
                options={[
                  { value: 'SUPER_ADMIN', label: 'Super Admin' },
                  { value: 'CENTER_ADMIN', label: 'Center Admin' }
                ]}
                value={formData.roleCode}
                onChange={v => setFormData({...formData, roleCode: v})}
                placeholder="Chọn vai trò..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Số điện thoại</label>
              <Input placeholder="09xxxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            {formData.roleCode === 'CENTER_ADMIN' && (
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Trực thuộc Trung tâm</label>
                <Select 
                  options={orgs?.items?.map((o: any) => ({ value: o.id, label: o.name })) || []}
                  value={formData.organizationId}
                  onChange={v => setFormData({...formData, organizationId: v})}
                  placeholder="Chọn trung tâm..."
                />
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        title="Sửa thông tin quản trị viên"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending} className="gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white">
              {updateMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Họ tên</label>
              <Input placeholder="Nhập tên admin..." value={editFormData.fullName} onChange={e => setEditFormData({...editFormData, fullName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Email (Không thể sửa)</label>
              <Input type="email" disabled value={selectedUser?.email || ''} className="bg-gray-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Vai trò</label>
              <Select 
                options={[
                  { value: 'SUPER_ADMIN', label: 'Super Admin' },
                  { value: 'CENTER_ADMIN', label: 'Center Admin' }
                ]}
                value={editFormData.roleCode}
                onChange={v => setEditFormData({...editFormData, roleCode: v})}
                placeholder="Chọn vai trò..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Số điện thoại</label>
              <Input placeholder="09xxxx" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} />
            </div>
            {editFormData.roleCode === 'CENTER_ADMIN' && (
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Trực thuộc Trung tâm</label>
                <Select 
                  options={orgs?.items?.map((o: any) => ({ value: o.id, label: o.name })) || []}
                  value={editFormData.organizationId}
                  onChange={v => setEditFormData({...editFormData, organizationId: v})}
                  placeholder="Chọn trung tâm..."
                />
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isLockOpen} 
        onClose={() => setIsLockOpen(false)} 
        title="Khóa tài khoản Admin"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsLockOpen(false)}>Hủy</Button>
            <Button variant="danger" onClick={handleLock} disabled={lockMutation.isPending} className="gap-2">
              {lockMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {lockMutation.isPending ? 'Đang khóa...' : 'Xác nhận Khóa'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-edu-fgSecondary text-sm mb-4">
            Khóa tài khoản <strong>{selectedUser?.fullName}</strong>. Người này sẽ bị đăng xuất và không thể đăng nhập lại.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div 
              onClick={() => setLockType('permanent')} 
              className={`cursor-pointer rounded-xl border p-4 transition-all ${lockType === 'permanent' ? 'border-edu-accent bg-edu-accentLight/20 shadow-sm' : 'border-edu-border hover:border-gray-300'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-edu-fg">Khóa vĩnh viễn</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${lockType === 'permanent' ? 'border-edu-accent' : 'border-gray-300'}`}>
                  {lockType === 'permanent' && <div className="w-2 h-2 rounded-full bg-edu-accent" />}
                </div>
              </div>
              <p className="text-xs text-edu-muted">Vô hiệu hóa hoàn toàn tài khoản này.</p>
            </div>
            
            <div 
              onClick={() => setLockType('date')} 
              className={`cursor-pointer rounded-xl border p-4 transition-all ${lockType === 'date' ? 'border-edu-accent bg-edu-accentLight/20 shadow-sm' : 'border-edu-border hover:border-gray-300'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-edu-fg">Khóa có thời hạn</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${lockType === 'date' ? 'border-edu-accent' : 'border-gray-300'}`}>
                  {lockType === 'date' && <div className="w-2 h-2 rounded-full bg-edu-accent" />}
                </div>
              </div>
              <p className="text-xs text-edu-muted">Chỉ khóa đến ngày chỉ định.</p>
            </div>
          </div>
          {lockType === 'date' && (
            <div className="mt-2 relative">
              <DatePicker 
                selected={lockDate} 
                onChange={(date) => setLockDate(date)} 
                showTimeSelect={false}
                placeholderText="Chọn ngày kết thúc khóa..."
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
