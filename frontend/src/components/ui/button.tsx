import React from 'react';
import { cn } from './stat-card';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon' | 'outline';
  size?: 'default' | 'sm' | 'icon';
}

const buttonVariants = {
  primary: 'bg-edu-accent text-white hover:bg-edu-accentHover hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(77,163,255,0.3)]',
  secondary: 'bg-white text-edu-fg border border-edu-border hover:border-edu-accent hover:text-edu-accent',
  outline: 'bg-white text-edu-fg border border-edu-border hover:border-edu-accent hover:text-edu-accent',
  danger: 'bg-edu-dangerLight text-edu-danger hover:bg-edu-danger hover:text-white',
  ghost: 'bg-transparent text-edu-fg hover:bg-edu-accentLighter',
  icon: 'bg-transparent text-edu-muted hover:bg-edu-accentLight hover:text-edu-accent p-0',
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
