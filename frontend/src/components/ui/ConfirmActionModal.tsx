import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  requireInput?: boolean;
  expectedInput?: string;
  isPending?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận hành động",
  description = "Bạn có chắc chắn muốn thực hiện hành động này không? Hành động này không thể hoàn tác.",
  requireInput = false,
  expectedInput = "XAC NHAN",
  isPending = false,
  variant = "danger"
}: ConfirmActionModalProps) {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (requireInput && inputValue !== expectedInput) return;
    onConfirm();
  };

  const isConfirmDisabled = (requireInput && inputValue !== expectedInput) || isPending;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          icon: 'text-orange-500',
          button: 'bg-orange-500 hover:bg-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-100',
          textDark: 'text-orange-900',
          borderLight: 'border-orange-200',
          focus: 'focus:border-orange-500 focus:ring-orange-500/20'
        };
      case 'info':
        return {
          icon: 'text-blue-600',
          button: 'bg-[#2563EB] hover:bg-blue-700',
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          textDark: 'text-blue-900',
          borderLight: 'border-blue-200',
          focus: 'focus:border-blue-500 focus:ring-blue-500/20'
        };
      case 'danger':
      default:
        return {
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700',
          bg: 'bg-red-50',
          border: 'border-red-100',
          textDark: 'text-red-900',
          borderLight: 'border-red-200',
          focus: 'focus:border-red-500 focus:ring-red-500/20'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={isPending ? () => {} : onClose}
      zIndex="z-[999]"
      title={
        <div className={`flex items-center gap-2 ${styles.icon}`}>
          <AlertTriangle size={20} />
          <span>{title}</span>
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Hủy bỏ
          </Button>
          <Button 
            className={`${styles.button} text-white gap-2 transition-colors disabled:opacity-50`}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-2">
        <p className="text-sm text-edu-fgSecondary">
          {description}
        </p>

        {requireInput && (
          <div className={`${styles.bg} p-4 rounded-lg border ${styles.border}`}>
            <label className={`block text-sm font-semibold ${styles.textDark} mb-2`}>
              Để xác nhận, vui lòng gõ <span className={`font-bold bg-white px-1 py-0.5 rounded border ${styles.borderLight}`}>{expectedInput}</span> vào ô bên dưới:
            </label>
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={expectedInput}
              className={`${styles.borderLight} ${styles.focus}`}
              disabled={isPending}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
