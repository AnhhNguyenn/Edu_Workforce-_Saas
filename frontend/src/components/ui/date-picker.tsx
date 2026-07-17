'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { vi } from 'date-fns/locale/vi';
import { format, setMonth, setYear } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import 'react-day-picker/style.css';
import { Portal } from './portal';

export interface DatePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  showTimeSelectOnly?: boolean;
  timeIntervals?: number;
  timeCaption?: string;
  dateFormat?: string;
  showMonthYearPicker?: boolean;
  showYearPicker?: boolean;
  wrapperClassName?: string;
}

const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

function CustomCaption({ displayMonth, onMonthChange }: { displayMonth: Date; onMonthChange: (date: Date) => void }) {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - 15 + i);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) setShowMonthPicker(false);
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setShowYearPicker(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex items-center justify-between px-2 pb-2">
      <button
        type="button"
        onClick={() => onMonthChange(setMonth(setYear(displayMonth, currentYear), currentMonth - 1))}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex items-center gap-2">
        {/* Month Picker */}
        <div ref={monthRef} className="relative">
          <button
            type="button"
            onClick={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
          >
            {MONTHS[currentMonth]}
            <ChevronDown size={14} className={`transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
          </button>
          {showMonthPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-[60] py-1 w-[140px] max-h-[220px] overflow-y-auto">
              {MONTHS.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onMonthChange(setMonth(displayMonth, i));
                    setShowMonthPicker(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                    i === currentMonth
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year Picker */}
        <div ref={yearRef} className="relative">
          <button
            type="button"
            onClick={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
          >
            {currentYear}
            <ChevronDown size={14} className={`transition-transform ${showYearPicker ? 'rotate-180' : ''}`} />
          </button>
          {showYearPicker && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-[60] py-1 w-[100px] max-h-[220px] overflow-y-auto">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    onMonthChange(setYear(displayMonth, y));
                    setShowYearPicker(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                    y === currentYear
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onMonthChange(setMonth(setYear(displayMonth, currentYear), currentMonth + 1))}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export function DatePicker({
  selected,
  onChange,
  placeholderText = 'Chọn ngày...',
  className = '',
  minDate,
  maxDate,
  wrapperClassName = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(selected || new Date());
  const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down');
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideInput = containerRef.current && containerRef.current.contains(target);
      const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);

      if (!clickedInsideInput && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (selected) setDisplayMonth(selected);
  }, [selected]);

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = dropdownRef.current ? dropdownRef.current.offsetHeight : 330;

      if (spaceBelow < dropdownHeight + 10 && spaceAbove > spaceBelow) {
        setOpenDirection('up');
        setCoords({
          top: rect.top - dropdownHeight - 6,
          left: rect.left,
        });
      } else {
        setOpenDirection('down');
        setCoords({
          top: rect.bottom + 6,
          left: rect.left,
        });
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative w-full ${wrapperClassName}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center gap-2 rounded-md border border-edu-border bg-white px-3.5 py-2 text-sm transition-all duration-200 outline-none hover:border-gray-300 focus:border-edu-accent focus:ring-4 focus:ring-edu-accentLight/50 ${
          !selected ? 'text-edu-muted' : 'text-edu-fg'
        } ${className}`}
      >
        <Calendar size={16} className="text-edu-muted flex-shrink-0" />
        <span className="truncate">
          {selected ? format(selected, 'dd/MM/yyyy') : placeholderText}
        </span>
      </button>

      {/* Dropdown Calendar */}
      {isOpen && (
        <Portal>
          <div 
            ref={dropdownRef}
            className="fixed z-[9999] bg-white rounded-xl border border-gray-200 shadow-xl"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
          >
            <div className="pt-3 px-1">
              <CustomCaption displayMonth={displayMonth} onMonthChange={setDisplayMonth} />
            </div>
            <DayPicker
              mode="single"
              selected={selected || undefined}
              onSelect={(date) => {
                onChange(date || null);
                setIsOpen(false);
              }}
              month={displayMonth}
              onMonthChange={setDisplayMonth}
              locale={vi}
              fromDate={minDate}
              toDate={maxDate}
              hideNavigation
              classNames={{
                root: 'px-3 pb-3',
                months: 'flex flex-col',
                month_caption: 'hidden',
                nav: 'hidden',
                weekdays: 'flex',
                weekday: 'w-9 text-center text-xs font-semibold text-gray-400 py-1',
                weeks: '',
                week: 'flex',
                day: 'w-9 h-9 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all duration-150 hover:bg-blue-50 hover:text-blue-600',
                day_button: 'w-full h-full flex items-center justify-center rounded-lg',
                selected: '!bg-blue-600 !text-white !font-bold hover:!bg-blue-700',
                today: 'font-bold text-blue-600 ring-1 ring-blue-200 rounded-lg',
                outside: 'text-gray-300',
                disabled: 'text-gray-200 cursor-not-allowed hover:bg-transparent',
              }}
            />
            {selected && (
              <div className="flex items-center justify-between px-4 pb-3 pt-0 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {format(selected, 'EEEE, dd/MM/yyyy', { locale: vi })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setIsOpen(false);
                  }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        </Portal>
      )}
    </div>
  );
}
