'use client';

import React from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from 'lucide-react';

// Đăng ký ngôn ngữ Tiếng Việt cho lịch
registerLocale('vi', vi);

export interface DatePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  dateFormat?: string;
}

export function DatePicker({
  selected,
  onChange,
  placeholderText = 'Chọn ngày...',
  className = '',
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat = showTimeSelect ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy',
}: DatePickerProps) {
  return (
    <div className="relative w-full">
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        locale="vi"
        dateFormat={dateFormat}
        placeholderText={placeholderText}
        minDate={minDate}
        maxDate={maxDate}
        showTimeSelect={showTimeSelect}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-edu-border bg-white px-3.5 py-2 pl-10 text-sm transition-all duration-200 outline-none focus:border-edu-accent focus:ring-4 focus:ring-edu-accentLight/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      />
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted pointer-events-none" size={16} />
    </div>
  );
}
