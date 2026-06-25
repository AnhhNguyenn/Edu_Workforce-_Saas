'use client';

import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { Loader2, Plus, Edit2, Shield, ShieldCheck, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { RoleModal } from "./_components/RoleModal";
import { AssignPermissionsModal } from "./_components/AssignPermissionsModal";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [selectedPermRole, setSelectedPermRole] = useState<any>(null);

  const [roleToDelete, setRoleToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/roles`);
      setRoles(res.data || []);
    } catch (err) {
      console.error("Failed to load roles", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const res = await apiClient.get('/roles/permissions');
      setAllPermissions(res.data || []);
    } catch (err) {
      console.error("Failed to load permissions", err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchAllPermissions();
  }, []);

  const handleCreate = () => {
    setSelectedRole(null);
    setIsRoleModalOpen(true);
  };

  const handleEdit = (role: any) => {
    setSelectedRole(role);
    setIsRoleModalOpen(true);
  };

  const handleAssignPermissions = (role: any) => {
    setSelectedPermRole(role);
    setIsPermModalOpen(true);
  };

  const handleDeleteClick = (role: any) => {
    if (role.isSystemRole) {
      alert("Không thể xóa vai trò hệ thống!");
      return;
    }
    setRoleToDelete(role);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/roles/${roleToDelete.id}`);
      fetchRoles();
      setRoleToDelete(null);
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-7">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Quản lý Phân quyền (Roles)</h2>
          <p className="text-edu-muted text-sm">Thiết lập các nhóm vai trò và chi tiết quyền truy cập cho nhân viên trung tâm</p>
        </div>
        <Button onClick={handleCreate} className="bg-edu-accent hover:bg-edu-accentDark text-white gap-2 shadow-sm">
          <Plus size={18} /> Thêm vai trò mới
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[200px]">Tên vai trò</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-[150px]">Loại</TableHead>
              <TableHead className="w-[120px] text-center">Số lượng quyền</TableHead>
              <TableHead className="w-[180px] text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-edu-muted">
                  <Loader2 className="animate-spin inline mr-2" size={24}/> Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <EmptyState description="Chưa có vai trò nào được tạo." />
                </TableCell>
              </TableRow>
            ) : (
              roles.filter(r => !r.isSystemRole).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <EmptyState description="Chưa có vai trò tùy chỉnh nào được tạo." />
                  </TableCell>
                </TableRow>
              ) : (
              roles.filter(r => !r.isSystemRole).map((role) => {
                const permCount = role.permissions?.length || 0;
                return (
                  <TableRow key={role.id} className="hover:bg-gray-50/30">
                    <TableCell>
                      <div className="font-semibold text-edu-fg flex items-center gap-2">
                        {role.name}
                        {role.name === 'SUPER_ADMIN' && <ShieldCheck size={16} className="text-blue-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-edu-muted text-sm max-w-[300px] truncate" title={role.description}>
                      {role.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.isSystemRole ? "muted" : "success"} className={role.isSystemRole ? "bg-gray-100" : ""}>
                        {role.isSystemRole ? "Hệ thống" : "Tùy chỉnh"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full text-xs border border-blue-100">
                        {permCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAssignPermissions(role)} 
                          title={role.isSystemRole ? "Hệ thống đã khóa quyền" : "Phân quyền chi tiết"}
                          disabled={role.isSystemRole}
                          className="hover:bg-indigo-50 border-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Shield size={14} className={role.isSystemRole ? "text-gray-400" : "text-indigo-600"}/>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(role)} 
                          title={role.isSystemRole ? "Không thể sửa vai trò hệ thống" : "Chỉnh sửa"} 
                          disabled={role.isSystemRole}
                          className="hover:bg-gray-100 border-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Edit2 size={14} className={role.isSystemRole ? "text-gray-400" : "text-gray-600"}/>
                        </Button>
                        {!role.isSystemRole && (
                          <Button variant="outline" size="sm" onClick={() => handleDeleteClick(role)} title="Xóa vai trò">
                            <Trash2 size={14} className="text-red-500"/>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSuccess={fetchRoles}
        role={selectedRole}
      />

      <AssignPermissionsModal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        onSuccess={fetchRoles}
        role={selectedPermRole}
        allPermissions={allPermissions}
      />

      <ConfirmActionModal
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa vai trò"
        description={`Bạn có chắc chắn muốn xóa vai trò '${roleToDelete?.name}' không? Các nhân viên đang có vai trò này có thể bị ảnh hưởng. Hành động này không thể hoàn tác.`}
        isPending={isDeleting}
        variant="danger"
      />
    </div>
  );
}
