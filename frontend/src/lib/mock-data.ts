export const VIETNAMESE_TEACHERS = [
  { name: 'Nguyễn Thị Minh Anh', role: 'teacher', school: 'THCS Hoàng Diệu', status: 'active', attendance: 96, sessions: 128, late: 3 },
  { name: 'Trần Văn Hùng', role: 'teacher', school: 'Tiểu học Lê Văn Tám', status: 'active', attendance: 89, sessions: 115, late: 8 },
  { name: 'Lê Thu Trang', role: 'assistant', school: 'THPT Trần Phú', status: 'active', attendance: 94, sessions: 98, late: 2 },
  { name: 'Phạm Đức Minh', role: 'teacher', school: 'Mầm non Hoa Sen', status: 'active', attendance: 92, sessions: 142, late: 5 },
  { name: 'Hoàng Thị Thu Hà', role: 'teacher', school: 'THCS Nguyễn Huệ', status: 'active', attendance: 97, sessions: 135, late: 1 },
  { name: 'Đỗ Quang Vinh', role: 'assistant', school: 'THCS Hoàng Diệu', status: 'on_leave', attendance: 88, sessions: 76, late: 6 },
  { name: 'Vũ Thị Bích Ngọc', role: 'teacher', school: 'Tiểu học Lê Văn Tám', status: 'active', attendance: 91, sessions: 120, late: 4 },
  { name: 'Ngô Thanh Tùng', role: 'teacher', school: 'THPT Trần Phú', status: 'active', attendance: 95, sessions: 108, late: 2 },
  { name: 'Bùi Thị Kim Liên', role: 'assistant', school: 'Mầm non Hoa Sen', status: 'active', attendance: 93, sessions: 89, late: 3 },
  { name: 'Đặng Quốc Bảo', role: 'teacher', school: 'THCS Nguyễn Huệ', status: 'inactive', attendance: 78, sessions: 45, late: 12 }
];

export const ORGANIZATIONS = [
  { name: 'EduCenter Sài Gòn', plan: 'Enterprise', teachers: 45, expires: '2025-12-31', status: 'active', city: 'TP.HCM' },
  { name: 'Trung tâm Anh ngữ Hà Nội', plan: 'Professional', teachers: 28, expires: '2025-08-15', status: 'active', city: 'Hà Nội' },
  { name: 'STEM Academy Đà Nẵng', plan: 'Starter', teachers: 12, expires: '2025-06-20', status: 'active', city: 'Đà Nẵng' },
  { name: 'MathKids Cần Thơ', plan: 'Professional', teachers: 18, expires: '2025-09-01', status: 'active', city: 'Cần Thơ' },
  { name: 'Trung tâm Kỹ năng Sống', plan: 'Starter', teachers: 8, expires: '2025-03-15', status: 'expired', city: 'TP.HCM' },
  { name: 'English Garden', plan: 'Enterprise', teachers: 52, expires: '2026-01-10', status: 'active', city: 'Hà Nội' },
  { name: 'Toán Tư Duy Omega', plan: 'Professional', teachers: 22, expires: '2025-11-30', status: 'active', city: 'TP.HCM' }
];

export const SCHOOLS = [
  { name: 'THCS Hoàng Diệu', addr: '123 Nguyễn Huệ, Q.1, TP.HCM', classes: 6, radius: 200 },
  { name: 'Tiểu học Lê Văn Tám', addr: '45 Lê Văn Sĩ, Q.3, TP.HCM', classes: 4, radius: 150 },
  { name: 'THPT Trần Phú', addr: '78 Trần Phú, Q.5, TP.HCM', classes: 8, radius: 250 },
  { name: 'Mầm non Hoa Sen', addr: '12 Võ Văn Tần, Q.3, TP.HCM', classes: 3, radius: 100 },
  { name: 'THCS Nguyễn Huệ', addr: '200 Nguyễn Huệ, Q.1, TP.HCM', classes: 5, radius: 200 }
];

export const TODAY_SESSIONS = [
  { time: '07:30', school: 'THCS Hoàng Diệu', cls: 'Lớp 8/2', teacher: 'Nguyễn Thị Minh Anh', assistant: 'Lê Thu Trang', lesson: 'Unit 5: Environment', status: 'completed' },
  { time: '09:00', school: 'Tiểu học Lê Văn Tám', cls: 'Lớp 3A', teacher: 'Trần Văn Hùng', assistant: '—', lesson: 'Unit 3: My Family', status: 'completed' },
  { time: '13:30', school: 'THPT Trần Phú', cls: 'Lớp 10A1', teacher: 'Ngô Thanh Tùng', assistant: 'Lê Thu Trang', lesson: 'Unit 7: Literature', status: 'in_progress' },
  { time: '15:00', school: 'Mầm non Hoa Sen', cls: 'Lớp Lá A', teacher: 'Phạm Đức Minh', assistant: 'Bùi Thị Kim Liên', lesson: 'Chủ đề: Động vật', status: 'upcoming' },
  { time: '17:30', school: 'THCS Nguyễn Huệ', cls: 'Lớp 7/1', teacher: 'Hoàng Thị Thu Hà', assistant: '—', lesson: 'Unit 4: Technology', status: 'upcoming' },
  { time: '18:00', school: 'THCS Hoàng Diệu', cls: 'Lớp 9/3', teacher: 'Vũ Thị Bích Ngọc', assistant: 'Đỗ Quang Vinh', lesson: 'Unit 6: Science', status: 'upcoming' }
];

export const AUDIT_LOGS = [
  { time: '10:32', user: 'Super Admin', action: 'Tạo trung tâm mới', detail: 'Toán Tư Duy Omega', type: 'create' },
  { time: '09:15', user: 'Admin SG', action: 'Reset password', detail: 'GV: Trần Văn Hùng', type: 'security' },
  { time: '08:45', user: 'Super Admin', action: 'Đổi plan', detail: 'STEM Academy: Starter → Professional', type: 'billing' },
  { time: '08:12', user: 'Admin HN', action: 'Khóa tài khoản', detail: 'GV: Đặng Quốc Bảo', type: 'security' },
  { time: 'Hôm qua 17:20', user: 'Super Admin', action: 'Tạo admin mới', detail: 'Admin: Lê Thị Mai — MathKids', type: 'create' },
  { time: 'Hôm qua 14:00', user: 'Admin SG', action: 'Chỉnh quota', detail: 'EduCenter SG: 50 → 60 teachers', type: 'billing' }
];

export const NOTIFICATIONS = [
  { title: 'Nguyễn Văn A đi trễ 12 phút', desc: 'THCS Hoàng Diệu — Lớp 8/2 — 07:42', icon: '⚠️', bg: 'bg-edu-dangerLight', time: '5 phút trước', unread: true },
  { title: 'Chưa nộp báo cáo: Lớp 3A', desc: 'GV: Trần Văn Hùng — Buổi sáng', icon: '📋', bg: 'bg-edu-warnLight', time: '30 phút trước', unread: true },
  { title: 'Check-in thành công', desc: 'Ngô Thanh Tùng — THPT Trần Phú — 12:58', icon: '✅', bg: 'bg-edu-successLight', time: '1 giờ trước', unread: false },
  { title: 'Lịch thay đổi: Lớp 7/1', desc: 'Đổi từ 16:00 → 17:30 — GV: Hoàng Thị Thu Hà', icon: '🔄', bg: 'bg-edu-accentLight', time: '2 giờ trước', unread: false },
  { title: 'Đặng Quốc Bảo checkout sớm', desc: 'Mầm non Hoa Sen — Về lúc 14:50 (sớm 10 phút)', icon: '⏰', bg: 'bg-edu-warnLight', time: 'Hôm qua', unread: false }
];

export const REPORTS = [
  { school: 'THCS Hoàng Diệu', cls: 'Lớp 8/2', teacher: 'Nguyễn Thị Minh Anh', date: 'Hôm nay', status: 'submitted', attendance: '38/40' },
  { school: 'Tiểu học Lê Văn Tám', cls: 'Lớp 3A', teacher: 'Trần Văn Hùng', date: 'Hôm nay', status: 'missing', attendance: '—' },
  { school: 'THPT Trần Phú', cls: 'Lớp 10A1', teacher: 'Ngô Thanh Tùng', date: 'Hôm nay', status: 'draft', attendance: '—' },
  { school: 'Mầm non Hoa Sen', cls: 'Lớp Lá A', teacher: 'Phạm Đức Minh', date: 'Hôm qua', status: 'submitted', attendance: '22/25' },
  { school: 'THCS Nguyễn Huệ', cls: 'Lớp 7/1', teacher: 'Hoàng Thị Thu Hà', date: 'Hôm qua', status: 'submitted', attendance: '35/38' }
];

// Helper functions for common logic
export const COLORS = ['#4DA3FF','#FF8A65','#81C784','#CE93D8','#FFD54F','#4DB6AC','#F48FB1','#90A4AE'];

export function getAvatarInitials(name: string) {
  return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase().slice(0, 2);
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
