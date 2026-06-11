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
      className={cn("gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white shadow-sm hover:shadow-md transition-all", className)} 
      {...props}
    >
      <Plus size={18} />
      {label}
    </Button>
  );
}
