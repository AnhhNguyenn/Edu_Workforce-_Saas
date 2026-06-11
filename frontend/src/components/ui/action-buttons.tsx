import React from 'react';
import { Edit2, Trash2, Lock, Unlock, Eye } from 'lucide-react';
import { Button } from './button';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  onView?: () => void;
  isLocked?: boolean;
  children?: React.ReactNode;
}

export function ActionButtons({ onEdit, onDelete, onToggleStatus, onView, isLocked = false, children }: ActionButtonsProps) {
  return (
    <div className="inline-flex w-fit items-center gap-1 bg-white/80 backdrop-blur rounded-[20px] shadow-sm border border-gray-100 p-1" onClick={(e) => e.stopPropagation()}>
      {children}
      {onView && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onView} 
          title="Xem chi tiết"
          className="h-7 w-7 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <Eye size={14} />
        </Button>
      )}
      
      {onToggleStatus && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleStatus} 
          title={isLocked ? "Mở khóa" : "Khóa"}
          className={`h-7 w-7 ${isLocked ? 'text-green-500 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`}
        >
          {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
        </Button>
      )}

      {onEdit && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onEdit} 
          title="Chỉnh sửa"
          className="h-7 w-7 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
        >
          <Edit2 size={14} />
        </Button>
      )}

      {onDelete && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDelete} 
          title="Xóa"
          className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={14} />
        </Button>
      )}
    </div>
  );
}
