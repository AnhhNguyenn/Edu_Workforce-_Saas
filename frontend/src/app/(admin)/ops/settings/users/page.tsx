'use client';

import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2, Plus, Edit2, Lock, Unlock, Trash2, KeyRound } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserModal } from "./_components/UserModal";
import { useMySubscription } from "@/hooks/queries/useSubscriptions";
import { useAppStore } from "@/store/useAppStore";

export default function UsersSettingsPage() {
  const { data: sub, isLoading: subLoading, isError: subError } = useMySubscription();
  const setUpgradeModalOpen = useAppStore(state => state.setUpgradeModalOpen);
  const isLocked = sub?.planName?.toLowerCase().includes("basic") || sub?.planName?.toLowerCase().includes("free") || subError;

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

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

  const handleLockToggle = async (user: any) => {
    const isLocked = user.lockEndAt && new Date(user.lockEndAt) > new Date();
    try {
      if (isLocked) {
        if (!confirm(`Bạn có chắc muốn MỞ KHÓA tài khoản ${user.email}?`)) return;
        await apiClient.post(`/users/${user.id}/unlock`);
      } else {
        if (!confirm(`Bạn có chắc muốn KHÓA tài khoản ${user.email} trong 100 năm?`)) return;
        // Lock for 100 years as a simple ban
        const lockEndAt = new Date();
        lockEndAt.setFullYear(lockEndAt.getFullYear() + 100);
        await apiClient.post(`/users/${user.id}/lock`, { lockEndAt: lockEndAt.toISOString() });
      }
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleResetPassword = async (user: any) => {
    const newPassword = prompt(`Nhập mật khẩu mới cho tài khoản ${user.email}:`);
    if (!newPassword) return;
    
    try {
      await apiClient.post(`/users/${user.id}/reset-password`, { newPassword });
      alert("Đổi mật khẩu thành công!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
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
                const isLocked = user.lockEndAt && new Date(user.lockEndAt) > new Date();
                
                return (
                  <TableRow key={user.id} className="hover:bg-gray-50/30">
                    <TableCell>
                      <div className="font-semibold text-edu-fg">{user.fullName}</div>
                      <div className="text-sm text-edu-muted">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info" className="font-medium bg-blue-50 text-blue-700">
                        {user.roleName || "Chưa có vai trò"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isLocked ? "danger" : "success"}>
                        {isLocked ? "Bị Khóa" : "Hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-edu-muted">
                      {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'dd/MM/yyyy HH:mm') : "Chưa đăng nhập"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(user)} title="Chỉnh sửa" className="hover:bg-gray-100 border-gray-200 transition-colors">
                          <Edit2 size={14} className="text-gray-600"/>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleResetPassword(user)} title="Đổi mật khẩu" className="hover:bg-blue-50 border-gray-200 transition-colors">
                          <KeyRound size={14} className="text-blue-600"/>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleLockToggle(user)} title={isLocked ? "Mở khóa" : "Khóa tài khoản"} className={isLocked ? "hover:bg-green-50 border-gray-200 transition-colors" : "hover:bg-red-50 border-gray-200 transition-colors"}>
                          {isLocked ? <Unlock size={14} className="text-green-600"/> : <Lock size={14} className="text-red-500"/>}
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

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
        user={selectedUser}
        roles={roles}
      />
    </div>
  );
}
