import { Key, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/providers/ConfirmProvider';
import { ActionButtons } from '@/components/ui/action-buttons';

interface RoleCardProps {
  role: any;
  onOpenPermissionModal: (role: any) => void;
  onEdit: (role: any) => void;
  onDelete: (roleId: string) => void;
}

export function RoleCard({ role, onOpenPermissionModal, onEdit, onDelete }: RoleCardProps) {
  const { confirm } = useConfirm();

  const handleDelete = () => {
    confirm({
      title: 'Xác nhận xóa chức vụ',
      description: 'Bạn có chắc chắn muốn xóa chức vụ này không? Các người dùng thuộc chức vụ này có thể sẽ bị mất quyền truy cập.',
      requireInput: true,
      expectedInput: 'XAC NHAN',
      action: () => {
        onDelete(role.id);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-edu-border hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#F3E5F5] text-[#7B1FA2] flex items-center justify-center">
            <Key size={24} />
          </div>
          <div className="flex flex-col justify-center">
            <Badge variant={role.isSystemRole ? 'info' : 'muted'} className={role.isSystemRole ? "bg-[#7B1FA2] text-white" : ""}>
              {role.isSystemRole ? 'Hệ thống' : 'Tùy chỉnh'}
            </Badge>
          </div>
        </div>
        <ActionButtons 
          onEdit={() => onEdit(role)} 
          onDelete={!role.isSystemRole ? handleDelete : undefined} 
        />
      </div>
      
      <h3 className="text-lg font-bold text-edu-fg mb-1">{role.name}</h3>
      <p className="text-sm text-edu-muted mb-6 flex-1">{role.description || 'Chưa có mô tả'}</p>
      
      <Button 
        variant="outline" 
        className="w-full justify-center gap-2 border-[#7B1FA2] text-[#7B1FA2] hover:bg-[#F3E5F5]"
        onClick={() => onOpenPermissionModal(role)}
      >
        <ShieldCheck size={16} />
        Cấu hình Quyền hạn
      </Button>
    </div>
  );
}
