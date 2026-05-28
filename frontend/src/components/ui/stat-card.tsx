import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type StatCardType = 'accent' | 'success' | 'warn' | 'danger';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  type?: StatCardType;
  className?: string;
}

const colors = {
  accent: { bg: 'bg-edu-accentLight', text: 'text-edu-accent', circle: 'after:bg-edu-accent' },
  success: { bg: 'bg-edu-successLight', text: 'text-edu-success', circle: 'after:bg-edu-success' },
  warn: { bg: 'bg-edu-warnLight', text: 'text-edu-warn', circle: 'after:bg-edu-warn' },
  danger: { bg: 'bg-edu-dangerLight', text: 'text-edu-danger', circle: 'after:bg-edu-danger' },
};

export function StatCard({ icon, label, value, change, type = 'accent', className }: StatCardProps) {
  const c = colors[type];

  return (
    <div className={cn(
      "bg-white rounded-2xl p-5 shadow-sm border border-edu-border hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden",
      "after:content-[''] after:absolute after:-top-5 after:-right-5 after:w-20 after:h-20 after:rounded-full after:opacity-10",
      c.circle,
      className
    )}>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", c.bg, c.text)}>
        {icon}
      </div>
      <div className="text-3xl font-bold leading-tight text-edu-fg">{value}</div>
      <div className="text-xs text-edu-muted mt-1">{label}</div>
      {change && (
        <div className={cn(
          "text-[0.75rem] mt-1.5 font-semibold",
          change.includes('+') && type !== 'danger' ? 'text-edu-success' : 'text-edu-danger'
        )}>
          {change}
        </div>
      )}
    </div>
  );
}
