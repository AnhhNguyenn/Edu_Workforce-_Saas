import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarInitials(name: string) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export function statusBadgeInfo(s: string): { cls: string, label: string } {
  const map: Record<string, [string, string]> = { 
    active: ['bg-edu-successLight text-edu-success', 'Hoạt động'], 
    inactive: ['bg-gray-100 text-edu-muted', 'Ngừng'], 
    expired: ['bg-edu-dangerLight text-edu-danger', 'Hết hạn'], 
    on_leave: ['bg-edu-warnLight text-edu-warn', 'Nghỉ phép'], 
    completed: ['bg-edu-successLight text-edu-success', 'Hoàn thành'], 
    in_progress: ['bg-edu-accentLight text-edu-accent', 'Đang diễn ra'], 
    upcoming: ['bg-gray-100 text-edu-muted', 'Sắp tới'], 
    submitted: ['bg-edu-successLight text-edu-success', 'Đã nộp'], 
    missing: ['bg-edu-dangerLight text-edu-danger', 'Chưa nộp'], 
    draft: ['bg-edu-warnLight text-edu-warn', 'Nháp'], 
    on_time: ['bg-edu-successLight text-edu-success', 'Đúng giờ'], 
    late: ['bg-edu-dangerLight text-edu-danger', 'Đi trễ'] 
  };
  const [cls, label] = map[s] || ['bg-gray-100 text-edu-muted', s];
  return { cls, label };
}
