import { useState } from 'react';
import { AlertTriangle, Loader2, Send, RotateCcw, Info } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type ConfirmVariant = 'danger' | 'success' | 'primary' | 'warn';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  requireInput?: boolean;
  expectedInput?: string;
  isPending?: boolean;
  variant?: ConfirmVariant;
  confirmText?: string;
}

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận hành động",
  description = "Bạn có chắc chắn muốn thực hiện hành động này không?",
  requireInput = false,
  expectedInput = "XAC NHAN",
  isPending = false,
  variant = 'danger',
  confirmText = 'Xác nhận'
}: ConfirmActionModalProps) {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (requireInput && inputValue !== expectedInput) return;
    onConfirm();
  };

  const isConfirmDisabled = (requireInput && inputValue !== expectedInput) || isPending;

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          icon: <Send size={20} className="text-emerald-600" />,
          titleClass: 'text-emerald-800',
          buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white'
        };
      case 'primary':
        return {
          icon: <Info size={20} className="text-blue-600" />,
          titleClass: 'text-blue-800',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      case 'warn':
        return {
          icon: <RotateCcw size={20} className="text-amber-600" />,
          titleClass: 'text-amber-800',
          buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      case 'danger':
      default:
        return {
          icon: <AlertTriangle size={20} className="text-rose-600" />,
          titleClass: 'text-rose-700',
          buttonClass: 'bg-rose-600 hover:bg-rose-700 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={isPending ? () => {} : onClose}
      title={
        <div className={`flex items-center gap-2.5 ${styles.titleClass}`}>
          {styles.icon}
          <span>{title}</span>
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Hủy bỏ
          </Button>
          <Button 
            className={`${styles.buttonClass} gap-2 font-semibold shadow-sm transition-all disabled:opacity-50`}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending ? 'Đang xử lý...' : confirmText}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-1">
        <p className="text-sm text-slate-700 leading-relaxed">
          {description}
        </p>

        {requireInput && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Để xác nhận, vui lòng gõ <span className="font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-900">{expectedInput}</span> vào ô bên dưới:
            </label>
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={expectedInput}
              disabled={isPending}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
