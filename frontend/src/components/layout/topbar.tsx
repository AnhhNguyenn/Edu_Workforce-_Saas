'use client';

import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/ui/stat-card';
import { Search, Menu, LogOut, User, Zap, X, CheckCircle2 } from 'lucide-react';
import { NotificationBell } from './notification-bell';
import { useSignalR } from '@/lib/useSignalR';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { usePlans, useSubscribe, useTransactionStatus, SubscribeResponseDto } from '@/hooks/queries/useSubscriptions';

export function Topbar() {
  const sidebarOpen = useAppStore(state => state.sidebarOpen);
  const toggleSidebar = useAppStore(state => state.toggleSidebar);
  const { data: session } = useSession();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize SignalR Connection
  useSignalR();

  const userRole = (session?.user as any)?.role || '';
  const initials = session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : 'SA';

  const { data: plans, isLoading: isPlansLoading } = usePlans();
  const subscribeMutation = useSubscribe();
  const [subscribeResult, setSubscribeResult] = useState<SubscribeResponseDto | null>(null);

  const { data: txStatus } = useTransactionStatus(subscribeResult?.referenceCode || null);

  useEffect(() => {
    if (txStatus === 'PAID') {
      // Refresh window after 2 seconds to reload session/permissions
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [txStatus]);

  const handleSubscribe = async (planId: string, billingCycle: 'MONTHLY' | 'YEARLY') => {
    try {
      const res = await subscribeMutation.mutateAsync({ planId, billingCycle });
      setSubscribeResult(res);
    } catch (error) {
      console.error('Failed to subscribe', error);
    }
  };

  return (
    <>
      <header className={cn(
        "h-16 bg-white/85 backdrop-blur-md border-b border-edu-border flex items-center px-4 md:px-8 fixed top-0 right-0 z-[40] transition-all duration-300",
        sidebarOpen ? "lg:left-[260px] left-0" : "left-0"
      )}>
        {/* Menu Toggle for mobile/tablet */}
        <button 
          onClick={toggleSidebar}
          className="mr-4 p-2 -ml-2 text-edu-muted hover:text-edu-accent hover:bg-edu-accentLight rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1 max-w-[400px] relative hidden sm:block">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted">
            <Search size={16} />
          </div>
          <Input 
            className="pl-9 bg-edu-bg border-transparent focus:bg-white transition-colors duration-300 shadow-sm" 
            placeholder="Tìm kiếm..."
          />
        </div>

        {/* Mobile Search Icon */}
        <div className="flex-1 sm:hidden flex justify-end pr-2">
          <button className="p-2 text-edu-muted hover:text-edu-accent transition-colors">
            <Search size={20} />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 relative">
          <NotificationBell />
          
          <div ref={menuRef} className="relative">
            <div 
              className="w-9 h-9 rounded-full bg-gradient-to-br from-edu-accent to-[#5AB8FF] flex items-center justify-center text-white font-bold text-xs cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ml-1 border-2 border-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {initials}
            </div>
            
            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute top-14 right-0 w-64 bg-white/95 backdrop-blur-md border border-gray-100/50 rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-4 z-[60]">
                <div className="px-4 py-2 border-b border-gray-50 mb-2">
                  <p className="font-semibold text-sm text-gray-800 truncate">{session?.user?.name || 'Người dùng'}</p>
                  <p className="text-xs text-gray-500 truncate">{session?.user?.email || 'Chưa đăng nhập'}</p>
                </div>
                
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  Thông tin tài khoản
                </button>
                
                {userRole === 'CENTER_ADMIN' && (
                  <button 
                    onClick={() => { setMenuOpen(false); setShowUpgradeModal(true); setSubscribeResult(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-edu-accent hover:bg-edu-accentLight flex items-center gap-2 font-medium"
                  >
                    <Zap size={16} className="text-edu-accent" />
                    Gói đăng ký / Nâng cấp
                  </button>
                )}
                
                <div className="border-t border-gray-50 my-1"></div>
                <button 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Upgrade Subscription Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">Nâng cấp gói dịch vụ</h2>
              <button onClick={() => setShowUpgradeModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 bg-gray-50/50">
              {subscribeResult ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  {txStatus === 'PAID' ? (
                    <div className="text-green-500 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                      <CheckCircle2 size={64} className="mb-4" />
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h3>
                      <p className="text-gray-600">Gói cước đã được kích hoạt. Đang làm mới hệ thống...</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Quét mã QR để thanh toán</h3>
                      <p className="text-gray-600 mb-6">Mã giao dịch: <strong>{subscribeResult.referenceCode}</strong></p>
                      {subscribeResult.qrCodeUrl ? (
                         <img src={subscribeResult.qrCodeUrl} alt="QR Code" className="w-64 h-64 rounded-xl border-4 border-white shadow-md mb-6" />
                      ) : (
                         <div className="w-64 h-64 rounded-xl border-4 border-white shadow-md mb-6 flex items-center justify-center bg-gray-100 text-gray-400">QR Code</div>
                      )}
                      
                      <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm p-4 rounded-lg flex items-start gap-3 max-w-md text-left">
                        <div className="animate-spin mt-0.5 rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent shrink-0"></div>
                        <p>Hệ thống đang chờ xác nhận thanh toán từ ngân hàng. Vui lòng không đóng cửa sổ này...</p>
                      </div>
                      
                      <button 
                        onClick={() => setSubscribeResult(null)} 
                        className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        Hủy giao dịch
                      </button>
                    </>
                  )}
                </div>
              ) : isPlansLoading ? (
                <div className="text-center py-10 text-gray-500">Đang tải danh sách gói cước...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans?.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
                      {plan.pricePerMonth > 0 && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                          Nổi bật
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-3xl font-extrabold text-gray-900">{plan.pricePerMonth.toLocaleString('vi-VN')}đ</span>
                        <span className="text-gray-500 text-sm">/tháng</span>
                      </div>
                      
                      <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex gap-2 text-sm text-gray-600"><CheckCircle2 size={18} className="text-green-500 shrink-0" /> Tối đa {plan.maxUsers} người dùng</li>
                        <li className="flex gap-2 text-sm text-gray-600"><CheckCircle2 size={18} className="text-green-500 shrink-0" /> Báo cáo cơ bản</li>
                        {plan.pricePerMonth > 0 && (
                           <>
                             <li className="flex gap-2 text-sm text-gray-600"><CheckCircle2 size={18} className="text-green-500 shrink-0" /> Báo cáo chuyên sâu</li>
                             <li className="flex gap-2 text-sm text-gray-600"><CheckCircle2 size={18} className="text-green-500 shrink-0" /> Hỗ trợ ưu tiên</li>
                           </>
                        )}
                      </ul>
                      
                      <div className="space-y-2 mt-auto">
                        <button 
                          onClick={() => handleSubscribe(plan.id, 'MONTHLY')}
                          disabled={subscribeMutation.isPending}
                          className="w-full py-2.5 rounded-lg bg-edu-accent hover:bg-blue-600 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
                        >
                          Đăng ký Tháng
                        </button>
                        <button 
                          onClick={() => handleSubscribe(plan.id, 'YEARLY')}
                          disabled={subscribeMutation.isPending}
                          className="w-full py-2.5 rounded-lg border border-edu-accent text-edu-accent hover:bg-edu-accentLight font-medium text-sm transition-colors disabled:opacity-50"
                        >
                          Đăng ký Năm (Tiết kiệm)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
