'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ConfirmActionModal } from '@/components/ui/ConfirmActionModal';

type ConfirmOptions = {
  title?: string;
  description?: string;
  requireInput?: boolean;
  expectedInput?: string;
  variant?: 'danger' | 'warning' | 'info';
  action: () => Promise<void> | void;
};

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => void;
};

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isPending, setIsPending] = useState(false);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const handleConfirm = async () => {
    if (options?.action) {
      setIsPending(true);
      try {
        await options.action();
      } catch (err) {
        console.error(err);
      } finally {
        setIsPending(false);
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setIsOpen(false);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmActionModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options?.title}
        description={options?.description}
        requireInput={options?.requireInput}
        expectedInput={options?.expectedInput}
        isPending={isPending}
        variant={options?.variant}
      />
    </ConfirmContext.Provider>
  );
}
