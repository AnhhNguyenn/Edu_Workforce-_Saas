'use client';

import React, { useState, useEffect, FormEvent } from "react";
import apiClient from "@/lib/api-client";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2, Plus, Edit2, Lock, Unlock, KeyRound, Eye, EyeOff, User } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserModal } from "./_components/UserModal";
import { useMySubscription } from "@/hooks/queries/useSubscriptions";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "react-hot-toast";

export default function UsersSettingsPage() {
  const { data: sub, isLoading: subLoading, isError: subError } = useMySubscription();
  const setUpgradeModalOpen = useAppStore(state => state.setUpgradeModalOpen);
  const isLocked = Boolean(sub?.planName?.toLowerCase().includes("basic") || sub?.planName?.toLowerCase().includes("free") || subError);

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // User Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Reset Password Modal State
  const [resetPwdUser, setResetPwdUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  // Confirm Action Modal (Lock / Unlock) State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    user: any;
    actionType: 'lock' | 'unlock' | null;
    isPending: boolean;
  }>({
    isOpen: false,
    user: null,
    actionType: null,
    isPending: false
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/users?pageSize=20&pageNumber=${page}`);
      setUsers(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await apiClient.get('/roles');
      setRoles(res.data || []);
    } catch (err) {
      console.error("Failed to load roles", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [page]);

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Open Confirm Modal for Lock/Unlock
  const promptLockToggle = (user: any) => {
    const isCurrentlyLocked = Boolean(user.lockEndAt && new Date(user.lockEndAt) > new Date());
    setConfirmState({
      isOpen: true,
      user,
      actionType: isCurrentlyLocked ? 'unlock' : 'lock',
      isPending: false
    });
  };

  // Execute Lock/Unlock Action
  const handleConfirmLockToggle = async () => {
    const { user, actionType } = confirmState;
    if (!user || !actionType) return;

    setConfirmState(prev => ({ ...prev, isPending: true }));
    try {
      if (actionType === 'unlock') {
        await apiClient.post(`/users/${user.id}/unlock`);
        toast.success(`Đã mở khóa tài khoản ${user.fullName || user.email}`);
      } else {
        const lockEndAt = new Date();
        lockEndAt.setFullYear(lockEndAt.getFullYear() + 100);
        await apiClient.post(`/users/${user.id}/lock`, { lockEndAt: lockEndAt.toISOString() });
        toast.success(`Đã khóa tài khoản ${user.fullName || user.email}`);
      }
      fetchUsers();
      setConfirmState({ isOpen: false, user: null, actionType: null, isPending: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
      setConfirmState(prev => ({ ...prev, isPending: false }));
    }
  };

  // Open Reset Password Modal
  const openResetPasswordModal = (user: any) => {
    setResetPwdUser(user);
    setNewPassword('');
    setShowPassword(false);
  };

  // Submit Reset Password
  const handleResetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    setIsSubmittingReset(true);
    try {
      await apiClient.post(`/users/${resetPwdUser.id}/reset-password`, { newPassword });
      toast.success(`Đã cấp lại mật khẩu mới cho tài khoản ${resetPwdUser.email}!`);
      setResetPwdUser(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi đổi mật khẩu");
    } finally {
      setIsSubmittingReset(false);
    }
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Lock className="text-gray-400" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-edu-fg mb-2">Tính năng bị khóa</h2>
        <p className="text-edu-muted text-center max-w-md mb-8">
          Quản lý người dùng nâng cao không khả dụng ở gói Basic. Vui lòng nâng cấp gói dịch vụ để mở khóa tính năng này.
        </p>
        <Button onClick={() => setUpgradeModalOpen(true)} className="bg-edu-accent hover:bg-edu-accentDark text-white px-8">
          Nâng cấp ngay
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-7">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Người dùng (Nâng cao)</h2>
          <p className="text-edu-muted text-sm">Danh sách tài khoản nhân sự và cấp quyền truy cập vào trung tâm</p>
        </div>
        <Button onClick={handleCreate} className="bg-edu-accent hover:bg-edu-accentDark text-white gap-2 shadow-sm">
          <Plus size={18} /> Thêm người dùng
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Vai trò (Role)</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Đăng nhập cuối</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-edu-muted">
                    <Loader2 className="animate-spin inline mr-2" size={24}/> Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <EmptyState description="Không tìm thấy người dùng nào." />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const isUserLocked = Boolean(user.lockEndAt && new Date(user.lockEndAt) > new Date());
                  
                  return (
                    <TableRow key={user.id} className="hover:bg-gray-50/30">
                      <TableCell>
                        <div className="font-semibold text-edu-fg">{user.fullName}</div>
                        <div className="text-sm text-edu-muted">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info" className="font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {user.roleName || "Chưa có vai trò"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isUserLocked ? "danger" : "success"}>
                          {isUserLocked ? "Bị Khóa" : "Hoạt động"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-edu-muted">
                        {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : "Chưa đăng nhập"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(user)} title="Chỉnh sửa" className="hover:bg-gray-100 border-gray-200 transition-colors">
                            <Edit2 size={14} className="text-gray-600"/>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openResetPasswordModal(user)} title="Đổi mật khẩu" className="hover:bg-blue-50 border-gray-200 transition-colors">
                            <KeyRound size={14} className="text-blue-600"/>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => promptLockToggle(user)} title={isUserLocked ? "Mở khóa" : "Khóa tài khoản"} className={isUserLocked ? "hover:bg-green-50 border-gray-200 transition-colors" : "hover:bg-red-50 border-gray-200 transition-colors"}>
                            {isUserLocked ? <Unlock size={14} className="text-green-600"/> : <Lock size={14} className="text-red-500"/>}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-edu-border flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-edu-muted">Trang <span className="font-medium text-edu-fg">{page}</span> / {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trước</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Sau</Button>
            </div>
          </div>
        )}
      </div>

      {/* USER EDIT / CREATE MODAL */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
        user={selectedUser}
        roles={roles}
      />

      {/* RESET PASSWORD MODAL (CHUẨN UI MODAL) */}
      <Modal
        isOpen={Boolean(resetPwdUser)}
        onClose={() => setResetPwdUser(null)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-edu-fg">Đổi Mật khẩu Tài khoản</h3>
              <p className="text-xs text-edu-muted font-normal">Cấp mật khẩu đăng nhập mới cho nhân sự</p>
            </div>
          </div>
        }
        className="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button variant="secondary" onClick={() => setResetPwdUser(null)} disabled={isSubmittingReset}>
              Hủy bỏ
            </Button>
            <Button 
              variant="primary" 
              onClick={handleResetPasswordSubmit} 
              disabled={isSubmittingReset || !newPassword}
              className="gap-2 font-semibold shadow-sm"
            >
              {isSubmittingReset && <Loader2 size={16} className="animate-spin" />}
              <span>Cập nhật mật khẩu</span>
            </Button>
          </div>
        }
      >
        {Boolean(resetPwdUser) && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                <User size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 truncate">{resetPwdUser?.fullName}</div>
                <div className="text-xs text-slate-500 truncate">{resetPwdUser?.email}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập tối thiểu 6 ký tự..."
                  className="pr-10 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Mật khẩu mới sẽ có hiệu lực ngay lập tức cho lần đăng nhập tiếp theo.
              </p>
            </div>
          </form>
        )}
      </Modal>

      {/* CONFIRM LOCK / UNLOCK MODAL */}
      <ConfirmActionModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmLockToggle}
        title={confirmState.actionType === 'unlock' ? `Mở khóa tài khoản "${confirmState.user?.fullName}"` : `Khóa tài khoản "${confirmState.user?.fullName}"`}
        description={
          confirmState.actionType === 'unlock'
            ? `Bạn có chắc chắn muốn MỞ KHÓA tài khoản ${confirmState.user?.email}? Tài khoản sẽ có thể đăng nhập lại bình thường.`
            : `Bạn có chắc chắn muốn KHÓA tài khoản ${confirmState.user?.email}? Tài khoản sẽ tạm thời bị vô hiệu hóa quyền truy cập.`
        }
        variant={confirmState.actionType === 'unlock' ? 'success' : 'danger'}
        confirmText={confirmState.actionType === 'unlock' ? 'Mở khóa ngay' : 'Xác nhận khóa'}
        isPending={confirmState.isPending}
      />
    </div>
  );
}
