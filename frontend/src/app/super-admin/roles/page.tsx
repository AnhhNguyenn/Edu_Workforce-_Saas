'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Shield, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoles, usePermissions, useUpdateRolePermissions, useDeleteRole } from '@/hooks/queries/useRoles';
import { RoleCard } from './_components/RoleCard';

// Lazi load Modals
const PermissionModal = dynamic(() => import('./_components/PermissionModal').then(m => m.PermissionModal), { ssr: false });
const CreateRoleModal = dynamic(() => import('./_components/CreateRoleModal'), { ssr: false });
const EditRoleModal = dynamic(() => import('./_components/EditRoleModal'), { ssr: false });

import { FeatureGuard } from '@/components/ui/feature-guard';

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
    setRolePermissions(role.permissions || []);
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
      // Optional: show toast success
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu phân quyền');
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
          <Button className="gap-2 bg-[#7B1FA2] hover:bg-[#6A1B9A]" onClick={() => setShowCreate(true)}>
            <Plus size={18} />
            Tạo chức vụ mới
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-3 text-center text-edu-muted py-10">Đang tải dữ liệu...</div>
          ) : roles.map((r: any, i: number) => (
            <RoleCard 
              key={i} 
              role={r} 
              onOpenPermissionModal={openPermissionModal} 
              onEdit={setEditingRole}
              onDelete={(id) => deleteMutation.mutate(id)}
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
