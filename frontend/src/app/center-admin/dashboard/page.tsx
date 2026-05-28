import { Building2, Users, Calendar, Clock } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

export default function CenterAdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Tổng quan trung tâm</h2>
        <p className="text-edu-muted text-sm">Quản lý lớp học và giáo viên — EduCenter Sài Gòn</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        <StatCard icon={<Users size={20} />} label="Giáo viên trực thuộc" value="45" type="accent" />
        <StatCard icon={<Building2 size={20} />} label="Lớp đang mở" value="12" type="success" />
        <StatCard icon={<Calendar size={20} />} label="Ca học hôm nay" value="8" type="warn" />
        <StatCard icon={<Clock size={20} />} label="Báo cáo điểm danh" value="5/8" change="Đã nộp" type="accent" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-5">
          <span className="font-semibold text-base text-edu-fg">Ca dạy hôm nay</span>
        </div>
        {/* Placeholder for Schedule Table */}
        <div className="text-sm text-edu-muted text-center py-10 border border-dashed border-edu-border rounded-xl bg-gray-50/50">
          Danh sách ca học hôm nay (Sẽ được lấy từ API)
        </div>
      </div>
    </div>
  );
}
