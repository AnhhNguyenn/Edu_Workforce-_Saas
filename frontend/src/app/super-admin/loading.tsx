'use client';

export default function Loading() {
  return (
    <div className="w-full h-full min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-edu-accentLight border-t-edu-accent rounded-full animate-spin"></div>
        <div className="text-sm font-semibold text-edu-muted">Đang tải dữ liệu...</div>
      </div>
    </div>
  );
}
