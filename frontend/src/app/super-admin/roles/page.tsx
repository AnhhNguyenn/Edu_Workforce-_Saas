'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Shield, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateButton } from '@/components/ui/create-button';
import { useRoles, usePermissions, useUpdateRolePermissions, useDeleteRole } from '@/hooks/queries/useRoles';
import { RoleCard } from './_components/RoleCard';

// Lazi load Modals
const PermissionModal = dynamic(() => import('./_components/PermissionModal').then(m => m.PermissionModal), { ssr: false });
const CreateRoleModal = dynamic(() => import('./_components/CreateRoleModal'), { ssr: false });
const EditRoleModal = dynamic(() => import('./_components/EditRoleModal'), { ssr: false });

import { FeatureGuard } from '@/components/ui/feature-guard';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function RolesPage() {
  const { data: roles = [], isLoading: loadingRoles } = useRoles();
  const { data: permissions = [], isLoading: loadingPerms } = usePermissions();
  const updatePermissionsMutation = useUpdateRolePermissions();
  const deleteMutation = useDeleteRole();

  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  
  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const isLoading = loadingRoles || loadingPerms;

  const openPermissionModal = async (role: any) => {
    setSelectedRole(role);
    setRolePermissions(role.permissions?.map((p: any) => p.id) || []);
    setShowModal(true);
  };

  const togglePermission = (permCode: string) => {
    setRolePermissions(prev => 
      prev.includes(permCode) 
        ? prev.filter(p => p !== permCode)
        : [...prev, permCode]
    );
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    try {
      await updatePermissionsMutation.mutateAsync({
        id: selectedRole.id,
        permissionIds: rolePermissions
      });
      setShowModal(false);
      toast.success('Lưu phân quyền thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu phân quyền');
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Đã xóa chức vụ thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa chức vụ");
    }
  };

  // Nhom permissions by EntityType
  const groupedPermissions = permissions.reduce((acc: Record<string, any[]>, curr: any) => {
    const group = curr.groupName || 'Chung';
    if (!acc[group]) acc[group] = [];
    acc[group].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <FeatureGuard featureKey="FEATURE_ROLES">
      <div className="max-w-7xl mx-auto space-y-7">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1 text-edu-fg">Phân quyền Hệ thống</h2>
            <p className="text-edu-muted text-sm">Quản lý các vai trò và quyền truy cập vào các module trong hệ thống</p>
          </div>
          <CreateButton className="bg-[#7B1FA2] hover:bg-[#6A1B9A]" onClick={() => setShowCreate(true)} label="Tạo chức vụ mới" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-3 text-center text-edu-muted py-10"><Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu...</div>
          ) : roles.length === 0 ? (
            <div className="col-span-3">
              <EmptyState description="Chưa có chức vụ nào trong hệ thống." />
            </div>
          ) : roles.map((r: any) => (
            <RoleCard 
              key={r.id} 
              role={r} 
              onOpenPermissionModal={openPermissionModal} 
              onEdit={setEditingRole}
              onDelete={handleDeleteRole}
            />
          ))}
        </div>

        {showModal && (
          <PermissionModal 
            selectedRole={selectedRole}
            permissions={permissions}
            rolePermissions={rolePermissions}
            isSaving={updatePermissionsMutation.isPending}
            onTogglePermission={togglePermission}
            onClose={() => setShowModal(false)}
            onSave={savePermissions}
          />
        )}

        {showCreate && <CreateRoleModal onClose={() => setShowCreate(false)} />}
        {editingRole && <EditRoleModal role={editingRole} onClose={() => setEditingRole(null)} />}
      </div>
    </FeatureGuard>
  );
}
