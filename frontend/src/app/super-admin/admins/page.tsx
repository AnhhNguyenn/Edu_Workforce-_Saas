'use client';

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { getAvatarInitials } from "@/lib/utils";
import { useUsers, useDeleteUser, useLockUser, useUnlockUser, useCreateUser, UserDto } from "@/hooks/queries/useUsers";
import { useOrganizations } from "@/hooks/queries/useOrganizations";

export default function AdminsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLockOpen, setIsLockOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [lockType, setLockType] = useState('permanent'); // 'permanent' or 'date'
  const [lockDate, setLockDate] = useState('');
  
  // Create form state
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'SUPER_ADMIN', phone: '', organizationId: '' });

  const { data: orgs } = useOrganizations();
  const { data: admins, isLoading, isError, error } = useUsers('SUPER_ADMIN'); // Assuming backend expects SUPER_ADMIN or we just fetch all for now, wait backend doesn't filter exactly yet.
  
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();
  const lockMutation = useLockUser();
  const unlockMutation = useUnlockUser();

  const handleCreate = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setFormData({ fullName: '', email: '', password: '', role: 'SUPER_ADMIN', phone: '', organizationId: '' });
      }
    });
  };

  const handleDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id, {
        onSuccess: () => setIsDeleteOpen(false)
      });
    }
  };

  const handleLock = () => {
    if (selectedUser) {
      const lockEndAt = lockType === 'date' && lockDate ? new Date(lockDate).toISOString() : null;
      lockMutation.mutate({ id: selectedUser.id, lockEndAt }, {
        onSuccess: () => setIsLockOpen(false)
      });
    }
  };

  const handleUnlock = (id: string) => {
    unlockMutation.mutate(id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Quản trị viên (Admins)</h2>
          <p className="text-edu-muted text-sm">Quản lý tài khoản Super Admin và Center Admin</p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus size={18} />
          Thêm Admin
        </Button>
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
              <Input placeholder="Tìm tên, email..." className="pl-9 h-9 text-sm" />
            </div>
            <Button variant="secondary" size="icon" className="h-9 w-9">
              <Filter size={16} />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
           <div className="p-10 text-center text-edu-muted">Đang tải dữ liệu admin...</div>
        ) : isError ? (
           <div className="p-10 text-center text-edu-danger">
             Lỗi kết nối API.
             <pre className="text-xs text-left mt-4 text-gray-500 overflow-auto whitespace-pre-wrap">
               {error instanceof Error ? error.message : JSON.stringify(error)}
             </pre>
           </div>
        ) : (
          <Table>
            <TableHeader>
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
              {admins?.items?.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-edu-accentLighter flex items-center justify-center text-edu-accent font-bold text-xs">
                        {getAvatarInitials(a.fullName || '')}
                      </div>
                      <div>
                        <div className="font-semibold text-edu-fg">{a.fullName}</div>
                        <div className="text-xs text-edu-muted">{a.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.role === 'SUPER_ADMIN' ? 'warn' : 'info'}>
                      {a.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-edu-fgSecondary">{a.organizationName || 'Tất cả'}</TableCell>
                  <TableCell className="text-edu-muted">{a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : 'Chưa đăng nhập'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={a.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {a.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                      </Badge>
                      {a.status === 'SUSPENDED' && a.lockEndAt && new Date(a.lockEndAt).getFullYear() < 9999 && (
                        <span className="text-[10px] text-edu-danger">Đến {new Date(a.lockEndAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Button variant="secondary" size="sm">Sửa</Button>
                      {a.status === 'ACTIVE' ? (
                        <Button variant="danger" size="sm" onClick={() => { setSelectedUser(a); setIsLockOpen(true); }}>
                          Khóa
                        </Button>
                      ) : (
                        <Button variant="primary" size="sm" onClick={() => handleUnlock(a.id)}>
                          Mở Khóa
                        </Button>
                      )}
                      <Button variant="secondary" size="sm" className="text-edu-danger border-edu-danger/20 hover:bg-edu-danger/10" onClick={() => { setSelectedUser(a); setIsDeleteOpen(true); }}>
                        Xóa
                      </Button>
                    </div>
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
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
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
                value={formData.role}
                onChange={v => setFormData({...formData, role: v})}
                placeholder="Chọn vai trò..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Số điện thoại</label>
              <Input placeholder="09xxxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            {formData.role === 'CENTER_ADMIN' && (
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
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        title="Xác nhận xóa Admin"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa tài khoản'}
            </Button>
          </>
        }
      >
        <p className="text-edu-fgSecondary text-sm">
          Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedUser?.fullName}</strong> ({selectedUser?.email}) không? Hành động này sẽ chuyển tài khoản vào trạng thái đã xóa, không thể đăng nhập.
        </p>
      </Modal>

      <Modal 
        isOpen={isLockOpen} 
        onClose={() => setIsLockOpen(false)} 
        title="Khóa tài khoản Admin"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsLockOpen(false)}>Hủy</Button>
            <Button variant="danger" onClick={handleLock} disabled={lockMutation.isPending}>
              {lockMutation.isPending ? 'Đang khóa...' : 'Xác nhận Khóa'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-edu-fgSecondary text-sm mb-4">
            Khóa tài khoản <strong>{selectedUser?.fullName}</strong>. Người này sẽ bị đăng xuất và không thể đăng nhập lại.
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-edu-fg">
              <input type="radio" name="lockType" checked={lockType === 'permanent'} onChange={() => setLockType('permanent')} />
              Khóa vĩnh viễn
            </label>
            <label className="flex items-center gap-2 text-sm text-edu-fg">
              <input type="radio" name="lockType" checked={lockType === 'date'} onChange={() => setLockType('date')} />
              Khóa có thời hạn (đến ngày)
            </label>
          </div>
          {lockType === 'date' && (
            <div className="mt-2">
              <Input type="datetime-local" value={lockDate} onChange={(e) => setLockDate(e.target.value)} />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
