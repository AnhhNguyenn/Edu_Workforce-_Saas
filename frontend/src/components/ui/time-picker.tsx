'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { Portal } from './portal';

export interface TimePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
}

export function TimePicker({
  selected,
  onChange,
  placeholderText = 'Chọn giờ...',
  className = '',
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down');
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  // Extract current hour and minute from selected Date
  const currentHour = selected ? selected.getHours() : 0;
  const currentMinute = selected ? selected.getMinutes() : 0;

  // Handle outside click to close dropdown (accounting for Portal rendering)
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideInput = containerRef.current && containerRef.current.contains(target);
      const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);

      if (!clickedInsideInput && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = dropdownRef.current ? dropdownRef.current.offsetHeight : 240;
      
      // Dropdown height is 240px (h-60). We check if spaceBelow is less than 250px
      if (spaceBelow < 250 && spaceAbove > spaceBelow) {
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

  // Calculate position and bind scroll/resize listeners
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      // Listen to scroll events on any parent container (using capture phase)
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Scroll selected items into view when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (hoursRef.current) {
          const selectedBtn = hoursRef.current.querySelector('[data-selected="true"]');
          if (selectedBtn) {
            hoursRef.current.scrollTop = (selectedBtn as HTMLElement).offsetTop - 70;
          }
        }
        if (minutesRef.current) {
          const selectedBtn = minutesRef.current.querySelector('[data-selected="true"]');
          if (selectedBtn) {
            minutesRef.current.scrollTop = (selectedBtn as HTMLElement).offsetTop - 70;
          }
        }
      }, 50); // Small timeout to ensure DOM is rendered
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentHour, currentMinute]);

  const handleHourSelect = (hour: number) => {
    const date = selected ? new Date(selected) : new Date();
    date.setHours(hour);
    date.setMinutes(currentMinute);
    date.setSeconds(0);
    date.setMilliseconds(0);
    onChange(date);
  };

  const handleMinuteSelect = (minute: number) => {
    const date = selected ? new Date(selected) : new Date();
    date.setHours(currentHour);
    date.setMinutes(minute);
    date.setSeconds(0);
    date.setMilliseconds(0);
    onChange(date);
  };

  const displayTime = selected
    ? selected.toTimeString().split(' ')[0].substring(0, 5)
    : '';

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-11 w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 pl-10 text-sm transition-all duration-200 outline-none text-left focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-50 ${
          !selected ? 'text-slate-400' : 'text-slate-800 font-medium'
        } ${className}`}
      >
        <span>{displayTime || placeholderText}</span>
        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
      </button>

      {isOpen && (
        <Portal>
          <div 
            ref={dropdownRef}
            className="fixed z-[9999] flex h-60 w-[180px] rounded-xl border border-slate-100 bg-white p-2.5 shadow-xl animate-in fade-in-0 zoom-in-95"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
          >
            {/* Hours Column */}
            <div
              ref={hoursRef}
              className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col gap-0.5 text-center select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
            >
              <div className="text-[10px] text-slate-400 font-bold mb-1.5 sticky top-0 bg-white py-0.5 z-10">GIỜ</div>
              {Array.from({ length: 24 }).map((_, h) => {
                const hh = h.toString().padStart(2, '0');
                const isSelected = selected !== null && selected !== undefined && currentHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => handleHourSelect(h)}
                    className={`py-1 text-sm rounded-md transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {hh}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="w-[1px] bg-slate-100 mx-2 self-stretch" />

            {/* Minutes Column */}
            <div
              ref={minutesRef}
              className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col gap-0.5 text-center select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
            >
              <div className="text-[10px] text-slate-400 font-bold mb-1.5 sticky top-0 bg-white py-0.5 z-10">PHÚT</div>
              {Array.from({ length: 60 }).map((_, m) => {
                const mm = m.toString().padStart(2, '0');
                const isSelected = selected !== null && selected !== undefined && currentMinute === m;
                return (
                  <button
                    key={m}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => handleMinuteSelect(m)}
                    className={`py-1 text-sm rounded-md transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {mm}
                  </button>
                );
              })}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
