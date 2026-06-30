import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Check } from "lucide-react";
import apiClient from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";

export interface Permission {
  id: string;
  module: string;
  action: string;
  description?: string;
}

interface AssignPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: any;
  allPermissions: Permission[];
}

export function AssignPermissionsModal({ isOpen, onClose, onSuccess, role, allPermissions }: AssignPermissionsModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    const groups: { [key: string]: Permission[] } = {};
    if (!allPermissions || !Array.isArray(allPermissions)) return groups;
    
    allPermissions.forEach(p => {
      const module = p.module || 'Others';
      if (!groups[module]) groups[module] = [];
      groups[module].push(p);
    });
    return groups;
  }, [allPermissions]);

  useEffect(() => {
    if (isOpen && role) {
      const currentIds = (role.permissions || []).map((p: any) => p.id);
      setSelectedPermissionIds(currentIds);
      setError("");
    }
  }, [isOpen, role]);

  const handleTogglePermission = (permId: string) => {
    if (role?.isSystem && role?.name === 'SUPER_ADMIN') return; // Cannot edit SUPER_ADMIN

    setSelectedPermissionIds(prev => {
      if (prev.includes(permId)) {
        return prev.filter(id => id !== permId);
      } else {
        return [...prev, permId];
      }
    });
  };

  const handleToggleModule = (modulePerms: Permission[]) => {
    if (role?.isSystem && role?.name === 'SUPER_ADMIN') return;

    const modulePermIds = modulePerms.map(p => p.id);
    const allSelected = modulePermIds.every(id => selectedPermissionIds.includes(id));

    if (allSelected) {
      // Unselect all in module
      setSelectedPermissionIds(prev => prev.filter(id => !modulePermIds.includes(id)));
    } else {
      // Select all in module
      setSelectedPermissionIds(prev => {
        const newSelected = new Set(prev);
        modulePermIds.forEach(id => newSelected.add(id));
        return Array.from(newSelected);
      });
    }
  };

  const handleSubmit = async () => {
    if (!role) return;
    
    setLoading(true);
    setError("");
    
    try {
      await apiClient.post(`/roles/${role.id}/permissions`, {
        permissionIds: selectedPermissionIds
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi khi phân quyền");
    } finally {
      setLoading(false);
    }
  };

  if (!role) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Phân quyền chi tiết (Assign Permissions)"
      className="max-w-4xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Đóng
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || role.name === 'SUPER_ADMIN'} 
            className="bg-edu-accent hover:bg-edu-accentDark text-white px-8"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Lưu phân quyền
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-edu-fg">Đang phân quyền cho: <span className="text-edu-accent">{role.name}</span></h3>
            <p className="text-sm text-edu-muted">{role.description || "Tùy chỉnh quyền truy cập và thao tác cho vai trò này trên hệ thống."}</p>
          </div>
          {role.isSystem && (
            <Badge variant="danger" className="ml-auto">Hệ thống (Không thể xóa)</Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {Object.entries(groupedPermissions).map(([module, perms]) => {
            const isAllSelected = perms.every(p => selectedPermissionIds.includes(p.id));
            const isIndeterminate = !isAllSelected && perms.some(p => selectedPermissionIds.includes(p.id));

            return (
              <div key={module} className="border border-edu-border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <h4 className="font-semibold text-edu-fg text-[15px]">{module}</h4>
                  <button
                    onClick={() => handleToggleModule(perms)}
                    disabled={role.name === 'SUPER_ADMIN'}
                    className={`text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                      isAllSelected 
                        ? 'bg-blue-100 text-blue-700' 
                        : isIndeterminate 
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {perms.map(perm => {
                    const isSelected = selectedPermissionIds.includes(perm.id);
                    const disabled = role.name === 'SUPER_ADMIN';

                    return (
                      <label 
                        key={perm.id} 
                        className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                        } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          isSelected ? 'bg-edu-accent border-edu-accent text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={() => handleTogglePermission(perm.id)}
                          disabled={disabled}
                        />
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${isSelected ? 'text-edu-accentDark' : 'text-gray-600'}`}>
                            {perm.action}
                          </span>
                          {perm.description && (
                            <span className="text-xs text-gray-400 mt-0.5">{perm.description}</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </Modal>
  );
}
