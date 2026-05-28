import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type BadgeVariant = 'success' | 'warn' | 'danger' | 'info' | 'muted';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  success: 'bg-edu-successLight text-edu-success',
  warn: 'bg-edu-warnLight text-edu-warn',
  danger: 'bg-edu-dangerLight text-edu-danger',
  info: 'bg-edu-accentLight text-edu-accent',
  muted: 'bg-[#F1F5F9] text-edu-muted',
};

export function Badge({ variant = 'muted', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
