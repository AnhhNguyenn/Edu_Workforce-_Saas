import React from 'react';
import { Plus } from 'lucide-react';
import { Button, ButtonProps } from './button';
import { cn } from './stat-card';

interface CreateButtonProps extends ButtonProps {
  label: string;
}

export function CreateButton({ label, className, ...props }: CreateButtonProps) {
  return (
    <Button 
      className={cn("gap-2 bg-white text-[#2563EB] border border-gray-200 hover:border-[#2563EB] hover:bg-blue-50/50 active:scale-95 shadow-sm transition-all", className)} 
      {...props}
    >
      <Plus size={18} />
      {label}
    </Button>
  );
}
