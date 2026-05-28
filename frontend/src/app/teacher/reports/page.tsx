'use client';

import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeacherReportsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-7 p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Nộp báo cáo</h2>
        <p className="text-edu-muted text-sm">Điểm danh và nhận xét buổi học</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border p-6 text-center">
        <div className="w-16 h-16 bg-edu-accentLight text-edu-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck size={32} />
        </div>
        <h3 className="font-bold text-lg mb-2">Chưa có ca học nào cần báo cáo</h3>
        <p className="text-sm text-edu-muted mb-6">Bạn chỉ có thể nộp báo cáo sau khi kết thúc ca học hoặc trong vòng 24h.</p>
        <Button>Xem lịch sử báo cáo</Button>
      </div>
    </div>
  );
}
