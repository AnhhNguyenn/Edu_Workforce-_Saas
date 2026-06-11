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
}

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận hành động",
  description = "Bạn có chắc chắn muốn thực hiện hành động này không? Hành động này không thể hoàn tác.",
  requireInput = false,
  expectedInput = "XAC NHAN",
  isPending = false
}: ConfirmActionModalProps) {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (requireInput && inputValue !== expectedInput) return;
    onConfirm();
  };

  const isConfirmDisabled = (requireInput && inputValue !== expectedInput) || isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isPending ? () => {} : onClose}
      title={
        <div className="flex items-center gap-2 text-red-600">
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
            className="bg-red-600 hover:bg-red-700 text-white gap-2 transition-colors disabled:opacity-50"
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
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <label className="block text-sm font-semibold text-red-900 mb-2">
              Để xác nhận, vui lòng gõ <span className="font-bold bg-white px-1 py-0.5 rounded border border-red-200">{expectedInput}</span> vào ô bên dưới:
            </label>
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={expectedInput}
              className="border-red-200 focus:border-red-500 focus:ring-red-500/20"
              disabled={isPending}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
