'use client';

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "./stat-card"

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({ options, value, onChange, placeholder = "Chọn...", className, disabled }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-edu-border bg-white px-3.5 py-2 text-sm transition-all duration-200 outline-none",
          "focus:border-edu-accent focus:ring-4 focus:ring-edu-accentLight/50",
          isOpen && "border-edu-accent ring-4 ring-edu-accentLight/50",
          disabled && "cursor-not-allowed opacity-50",
          !selectedOption && "text-edu-muted",
          className
        )}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={16} className="text-edu-muted opacity-70 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-edu-border bg-white py-1.5 shadow-xl animate-in fade-in-0 zoom-in-95">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-edu-muted text-center">Không có dữ liệu</div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-3 pr-9 text-sm outline-none transition-colors mx-1.5 w-[calc(100%-12px)]",
                  "text-edu-fg hover:bg-edu-accentLighter hover:text-edu-accent",
                  value === option.value && "bg-edu-accentLighter text-edu-accent font-semibold"
                )}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && (
                  <span className="absolute right-3 flex items-center justify-center text-edu-accent">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
