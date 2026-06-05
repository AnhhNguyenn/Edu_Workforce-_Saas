'use client';

import React, { useEffect, useState } from 'react';
import { cn } from './stat-card'; // Reuse cn from there for now, or move to lib/utils
import { Portal } from './portal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <Portal>
      <div
        className={cn(
          "fixed inset-0 z-[200] flex items-center justify-center",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none delay-200"
        )}
      >
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-[#1A2B42]/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div
          className={cn(
            "bg-white rounded-2xl shadow-xl w-[95vw] md:w-full max-w-[520px] md:max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 transition-all duration-300 ease-out",
            isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-[0.95] opacity-0",
            className
          )}
        >
          <div className="px-6 py-5 flex justify-between items-center border-b border-transparent">
            <h3 className="text-[1.15rem] font-bold text-edu-fg">{title}</h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-edu-muted hover:bg-edu-accentLight hover:text-edu-accent transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="px-6 py-5">
            {children}
          </div>

          {footer && (
            <div className="px-6 py-5 flex justify-end gap-2.5 border-t border-transparent">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
