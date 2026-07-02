'use client';

import { Mail, Phone, BarChart2, Star, Edit, Lock, LogOut, Loader2, MapPin, Camera, ChevronDown } from "lucide-react";
import { useProfile, useUpdateProfile, useUploadAvatar, useProfileStats, useChangePassword } from "@/hooks/queries/useProfile";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/providers/ConfirmProvider";
import { cn } from "@/components/ui/stat-card";
import { Select } from "@/components/ui/select";

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const changePassword = useChangePassword();
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [editForm, setEditForm] = useState({ phone: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  
  // Default to current month
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<{ month?: number, year?: number }>({ 
    month: currentDate.getMonth() + 1, 
    year: currentDate.getFullYear() 
  });
  
  const { confirm } = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { data: statsData, isLoading: isStatsLoading } = useProfileStats(selectedMonth.month, selectedMonth.year);

  useEffect(() => {
    if (profile) {
      setEditForm({ 
        phone: profile.phone || '', 
        address: profile.address || '' 
      });
    }
  }, [profile]);

  const handleUpdate = async () => {
    try {
      await updateProfile.mutateAsync(editForm);
      toast.success('Cập nhật thông tin thành công!');
      setIsEditOpen(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi cập nhật thông tin');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB");
      return;
    }

    try {
      await uploadAvatar.mutateAsync(file);
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Lỗi khi cập nhật ảnh");
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    
    try {
      await changePassword.mutateAsync({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword });
      toast.success("Đổi mật khẩu thành công!");
      setIsPasswordOpen(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="animate-spin text-edu-accent" size={32} /></div>;
  }

  const avatarInitials = profile?.fullName ? profile.fullName.split(' ').map(n => n[0]).slice(-2).join('') : 'U';
  const isTeacher = profile?.role === 'TEACHER';

  return (
    <div className="pb-24 md:pb-8 relative max-w-2xl mx-auto">
      {/* Cover Header */}
      <div className="h-40 rounded-b-[2rem] bg-gradient-to-r from-blue-600 to-edu-accent relative overflow-hidden -mx-4 px-4 sm:mx-0 sm:rounded-3xl sm:mt-4 shadow-md">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-300/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
      </div>

      {/* Avatar & Basic Info */}
      <div className="px-4 flex flex-col items-center -mt-16 mb-8 relative z-10">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-28 h-28 rounded-full bg-white p-1.5 shadow-xl relative overflow-hidden">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#81C784] to-[#A5D6A7] flex items-center justify-center text-white font-bold text-4xl">
                {avatarInitials}
              </div>
            )}
            
            {/* Avatar Upload Overlay */}
            <div className="absolute inset-1.5 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadAvatar.isPending ? (
                <Loader2 size={24} className="text-white animate-spin" />
              ) : (
                <Camera size={24} className="text-white" />
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mt-3 mb-1">
          {profile?.fullName || "Chưa cập nhật tên"}
        </h1>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-bold tracking-wide">
            {isTeacher ? 'Giáo viên' : 'Trợ giảng'}
          </span>
          <span className="text-slate-400 text-sm font-medium">•</span>
          <span className="text-slate-500 text-sm font-medium">
            {profile?.organizationName || 'Chưa cập nhật cơ sở'}
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-0 space-y-6">
        {/* Stats Grid */}
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-sm font-bold text-slate-800">Thống kê hoạt động</h2>
          <div className="w-[180px]">
            <Select 
              value={selectedMonth.month ? `${selectedMonth.month}-${selectedMonth.year}` : 'all'}
              onChange={(val) => {
                if (val === 'all') {
                  setSelectedMonth({});
                } else {
                  const [month, year] = val.split('-');
                  setSelectedMonth({ month: parseInt(month), year: parseInt(year) });
                }
              }}
              options={[
                { value: `${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`, label: `Tháng ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}` },
                { value: `${currentDate.getMonth() === 0 ? 12 : currentDate.getMonth()}-${currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear()}`, label: `Tháng ${currentDate.getMonth() === 0 ? 12 : currentDate.getMonth()}/${currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear()}` },
                { value: 'all', label: 'Tất cả thời gian' }
              ]}
              className="!h-8 !py-1 !px-2.5 !rounded-lg !text-xs !font-semibold border-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => {
              const q = selectedMonth.month ? `?month=${selectedMonth.month}&year=${selectedMonth.year}` : '';
              router.push(`/me/profile/sessions${q}`);
            }}
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 cursor-pointer hover:shadow-md hover:border-blue-100 transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
              <BarChart2 size={20} className="text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">
                {isStatsLoading ? <Loader2 size={20} className="animate-spin text-slate-400 mt-2 mb-1" /> : (statsData?.totalSessions || 0)}
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Tổng buổi dạy</div>
            </div>
          </div>
          
          <div 
            onClick={() => {
              const q = selectedMonth.month ? `?month=${selectedMonth.month}&year=${selectedMonth.year}` : '';
              router.push(`/me/profile/attendance${q}`);
            }}
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 cursor-pointer hover:shadow-md hover:border-amber-100 transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Star size={20} className="text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">
                {isStatsLoading ? <Loader2 size={20} className="animate-spin text-slate-400 mt-2 mb-1" /> : `${statsData?.attendanceRate || 0}%`}
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Tỷ lệ chuyên cần</div>
            </div>
          </div>
        </div>

        {/* Contact Info Block */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
              <Mail size={18} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</div>
              <div className="text-[15px] font-semibold text-slate-800 truncate">{profile?.email || 'N/A'}</div>
            </div>
          </div>
          
          <div className="p-4 border-b border-slate-50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Số điện thoại</div>
              <div className="text-[15px] font-semibold text-slate-800 truncate">{profile?.phone || 'Chưa cập nhật'}</div>
            </div>
          </div>

          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Địa chỉ</div>
              <div className="text-[15px] font-semibold text-slate-800 line-clamp-2">{profile?.address || 'Chưa cập nhật'}</div>
            </div>
          </div>
        </div>

        {/* Settings Block */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <button 
            onClick={() => setIsEditOpen(true)}
            className="w-full p-4 border-b border-slate-50 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Edit size={16} className="text-blue-500" />
            </div>
            <span className="text-[15px] font-bold text-slate-700 flex-1">Cập nhật thông tin</span>
          </button>
          
          <button 
            onClick={() => setIsPasswordOpen(true)}
            className="w-full p-4 border-b border-slate-50 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Lock size={16} className="text-slate-500" />
            </div>
            <span className="text-[15px] font-bold text-slate-700 flex-1">Đổi mật khẩu</span>
          </button>
          
          <button 
            onClick={() => {
              confirm({
                title: "Đăng xuất",
                description: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",
                action: async () => {
                  await signOut({ callbackUrl: '/login' });
                }
              });
            }}
            className="w-full p-4 flex items-center gap-3 hover:bg-red-50 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
              <LogOut size={16} className="text-red-500" />
            </div>
            <span className="text-[15px] font-bold text-red-500 flex-1">Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        title="Cập nhật thông tin"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button 
              className="bg-edu-accent hover:bg-edu-accentDark text-white gap-2" 
              onClick={handleUpdate}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending && <Loader2 size={16} className="animate-spin" />}
              {updateProfile.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
            <Input 
              placeholder="Nhập số điện thoại..." 
              value={editForm.phone}
              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Địa chỉ</label>
            <Input 
              placeholder="Nhập địa chỉ của bạn..." 
              value={editForm.address}
              onChange={(e) => setEditForm({...editForm, address: e.target.value})}
            />
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal 
        isOpen={isPasswordOpen} 
        onClose={() => setIsPasswordOpen(false)} 
        title="Đổi mật khẩu"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPasswordOpen(false)}>Hủy</Button>
            <Button 
              className="bg-edu-accent hover:bg-edu-accentDark text-white gap-2" 
              onClick={handlePasswordChange}
              disabled={changePassword.isPending}
            >
              {changePassword.isPending && <Loader2 size={16} className="animate-spin" />}
              {changePassword.isPending ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
            <Input 
              type="password"
              placeholder="Nhập mật khẩu hiện tại..." 
              value={passwordForm.oldPassword}
              onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
            <Input 
              type="password"
              placeholder="Nhập mật khẩu mới..." 
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
            <Input 
              type="password"
              placeholder="Nhập lại mật khẩu mới..." 
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
