import { X, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Portal } from '@/components/ui/portal';

interface PermissionModalProps {
  selectedRole: any;
  permissions: any[];
  rolePermissions: string[];
  isSaving: boolean;
  onTogglePermission: (id: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function PermissionModal({
  selectedRole,
  permissions,
  rolePermissions,
  isSaving,
  onTogglePermission,
  onClose,
  onSave
}: PermissionModalProps) {
  if (!selectedRole) return null;

  // Nhóm permissions theo Module
  const groupedPermissions = permissions.reduce((acc: Record<string, any[]>, curr: any) => {
    const group = curr.module || 'Chung';
    if (!acc[group]) acc[group] = [];
    acc[group].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Portal>
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-edu-border flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
            <div>
              <h2 className="text-xl font-bold text-edu-fg">Phân quyền: <span className="text-[#7B1FA2]">{selectedRole?.name}</span></h2>
              <p className="text-sm text-edu-muted mt-1">Chọn các quyền tương ứng cho vai trò này</p>
            </div>
            <button onClick={onClose} className="p-2 text-edu-muted hover:text-edu-fg rounded-full hover:bg-gray-200 transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 bg-[#FAFAFA]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedPermissions).map(([group, perms]) => (
                <div key={group} className="bg-white p-5 rounded-xl border border-edu-border shadow-sm">
                  <h3 className="font-bold text-edu-fg mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#7B1FA2]"></div>
                    {group}
                  </h3>
                  <div className="space-y-3">
                    {(perms as any[]).map((p: any) => {
                      const isChecked = rolePermissions.includes(p.id);
                      return (
                        <div 
                          key={p.id} 
                          className="flex items-start gap-3 cursor-pointer group"
                          onClick={() => onTogglePermission(p.id)}
                        >
                          <div className={`mt-0.5 transition-colors ${isChecked ? 'text-[#4CAF50]' : 'text-gray-300 group-hover:text-gray-400'}`}>
                            {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                          </div>
                          <div>
                            <div className={`text-sm font-semibold transition-colors ${isChecked ? 'text-edu-fg' : 'text-edu-fgSecondary'}`}>
                              {p.action}
                            </div>
                            <div className="text-xs text-edu-muted mt-0.5">{p.description}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-edu-border flex justify-end gap-3 bg-white rounded-b-2xl">
            <Button variant="outline" onClick={onClose}>Hủy bỏ</Button>
            <Button onClick={onSave} disabled={isSaving} className="bg-[#7B1FA2] hover:bg-[#6A1B9A]">
              {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
