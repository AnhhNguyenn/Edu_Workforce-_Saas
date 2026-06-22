'use client';

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "./stat-card"

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({ options, value, onChange, placeholder = "Chọn...", className, disabled }: MultiSelectProps) {
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

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex min-h-[40px] w-full items-center justify-between rounded-md border border-edu-border bg-white px-3.5 py-1.5 text-sm transition-all duration-200 outline-none",
          "focus:border-edu-accent focus:ring-4 focus:ring-edu-accentLight/50",
          isOpen && "border-edu-accent ring-4 ring-edu-accentLight/50",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="flex flex-wrap gap-1.5 flex-1 pr-2">
          {selectedOptions.length === 0 ? (
            <span className="text-edu-muted my-1">{placeholder}</span>
          ) : (
            selectedOptions.map(opt => (
              <span key={opt.value} className="bg-edu-accentLighter text-edu-accent border border-edu-accentLight px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1.5">
                {opt.label}
                <X size={12} className="cursor-pointer hover:text-red-500" onClick={(e) => removeOption(e, opt.value)} />
              </span>
            ))
          )}
        </div>
        <ChevronDown size={16} className="text-edu-muted opacity-70 transition-transform duration-200 shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-edu-border bg-white py-1.5 shadow-xl animate-in fade-in-0 zoom-in-95">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-edu-muted text-center">Không có dữ liệu</div>
          ) : (
            options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-3 pr-9 text-sm outline-none transition-colors mx-1.5 w-[calc(100%-12px)]",
                    "text-edu-fg hover:bg-edu-accentLighter hover:text-edu-accent",
                    isSelected && "bg-edu-accentLighter text-edu-accent font-semibold"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <span className="absolute right-3 flex items-center justify-center text-edu-accent">
                      <Check size={16} strokeWidth={3} />
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
