'use client';

import React from 'react';
import { Modal } from './modal';
import { Button } from './button';
import { Lock, Crown, ArrowRight } from 'lucide-react';

export function UpgradeWarningModal({ isOpen, onClose, onUpgradeClick }: { isOpen: boolean, onClose: () => void, onUpgradeClick: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nâng cấp gói để tiếp tục" className="max-w-md">
      <div className="flex flex-col items-center text-center py-6">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <Lock size={32} />
        </div>
        <h3 className="text-xl font-bold text-edu-fg mb-2">Tính năng cao cấp</h3>
        <p className="text-edu-muted text-sm mb-8 leading-relaxed px-4">
          Gói hiện tại của bạn không hỗ trợ tính năng này. Vui lòng nâng cấp lên gói cao hơn để mở khóa toàn bộ sức mạnh của hệ thống.
        </p>
        
        <div className="w-full flex flex-col gap-3">
          <Button 
            onClick={() => {
              onClose();
              onUpgradeClick();
            }} 
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md border-0 group"
          >
            <Crown size={20} className="mr-2 text-white/90" />
            Xem các gói & Nâng cấp ngay
            <ArrowRight size={18} className="ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="secondary" onClick={onClose} className="w-full h-11 bg-gray-100 hover:bg-gray-200">
            Để sau
          </Button>
        </div>
      </div>
    </Modal>
  );
}
