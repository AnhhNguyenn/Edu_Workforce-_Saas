import React from 'react';
import { cn } from './stat-card';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon' | 'outline';
  size?: 'default' | 'sm' | 'icon';
}

const buttonVariants = {
  primary: 'bg-white text-[#2563EB] border border-gray-200 hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50/50 active:scale-95 shadow-sm',
  secondary: 'bg-white text-edu-fg border border-edu-border hover:border-[#2563EB] hover:text-[#2563EB] active:scale-95',
  outline: 'bg-white text-edu-fg border border-edu-border hover:border-[#2563EB] hover:text-[#2563EB] active:scale-95',
  danger: 'bg-edu-dangerLight text-edu-danger hover:bg-edu-danger hover:text-white',
  ghost: 'bg-transparent text-edu-fg hover:bg-blue-50 active:scale-95',
  icon: 'bg-transparent text-edu-muted hover:bg-blue-50 hover:text-[#2563EB] p-0 active:scale-95',
};

const sizeVariants = {
  default: 'px-5 py-2.5',
  sm: 'px-3.5 py-1.5 text-sm',
  icon: 'w-9 h-9 flex items-center justify-center',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-200',
          buttonVariants[variant],
          variant === 'icon' ? sizeVariants.icon : sizeVariants[size],
          props.disabled && 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
