import { Mail, Phone, BarChart2, Star, Edit, Lock, LogOut } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6 pt-6 pb-4">
      {/* Avatar Section */}
      <div className="text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-[1.25rem] bg-gradient-to-br from-[#81C784] to-[#A5D6A7] flex items-center justify-center text-white font-bold text-2xl shadow-sm mb-4">
          MA
        </div>
        <h2 className="text-lg font-bold text-edu-fg mb-0.5">Nguyễn Thị Minh Anh</h2>
        <p className="text-xs font-medium text-edu-muted">Giáo viên — THCS Hoàng Diệu</p>
      </div>

      {/* Info List */}
      <div className="bg-white rounded-2xl border border-edu-border overflow-hidden">
        <div className="flex items-center gap-4 p-4 border-b border-edu-border">
          <Mail size={18} className="text-edu-muted shrink-0" />
          <div className="flex-1">
            <div className="text-[0.65rem] font-semibold text-edu-muted uppercase tracking-wider mb-0.5">Email</div>
            <div className="text-sm font-semibold text-edu-fg">minhanh@eduops.vn</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 border-b border-edu-border">
          <Phone size={18} className="text-edu-muted shrink-0" />
          <div className="flex-1">
            <div className="text-[0.65rem] font-semibold text-edu-muted uppercase tracking-wider mb-0.5">Số điện thoại</div>
            <div className="text-sm font-semibold text-edu-fg">0912 345 678</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 border-b border-edu-border">
          <BarChart2 size={18} className="text-edu-muted shrink-0" />
          <div className="flex-1">
            <div className="text-[0.65rem] font-semibold text-edu-muted uppercase tracking-wider mb-0.5">Tổng buổi dạy</div>
            <div className="text-sm font-semibold text-edu-fg">128 buổi</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4">
          <Star size={18} className="text-edu-warn shrink-0" />
          <div className="flex-1">
            <div className="text-[0.65rem] font-semibold text-edu-muted uppercase tracking-wider mb-0.5">Attendance Rate</div>
            <div className="text-sm font-semibold text-edu-success">96% (Xuất sắc)</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-edu-border text-edu-fg rounded-xl text-sm font-bold hover:bg-edu-accentLighter transition-colors">
          <Edit size={16} className="text-edu-muted" />
          Chỉnh sửa thông tin
        </button>
        <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-edu-border text-edu-fg rounded-xl text-sm font-bold hover:bg-edu-accentLighter transition-colors">
          <Lock size={16} className="text-edu-muted" />
          Đổi mật khẩu
        </button>
        <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-edu-dangerLight text-edu-danger border border-transparent rounded-xl text-sm font-bold hover:bg-edu-danger hover:text-white transition-colors mt-2">
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
