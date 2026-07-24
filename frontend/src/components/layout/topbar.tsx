'use client';

import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/ui/stat-card';
import { Search, Menu, LogOut, User, Zap, X, CheckCircle2, QrCode, Clock, Crown, Tag, Send, Gem, ArrowRight, ShieldCheck, Star, Lock } from 'lucide-react';
import { NotificationBell } from './notification-bell';
import { useSignalR } from '@/lib/useSignalR';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { usePlans, useSubscribe, usePreviewSubscribe, useTransactionStatus, SubscribeResponseDto, PreviewSubscribeResponseDto, useMySubscription, useCancelTransaction } from '@/hooks/queries/useSubscriptions';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const sidebarOpen = useAppStore(state => state.sidebarOpen);
  const toggleSidebar = useAppStore(state => state.toggleSidebar);
  const showUpgradeModal = useAppStore(state => state.upgradeModalOpen);
  const setShowUpgradeModal = useAppStore(state => state.setUpgradeModalOpen);
  const { data: session } = useSession();
  const router = useRouter();
  
  const [menuOpen, setMenuOpen] = useState(false);
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
  const previewSubscribeMutation = usePreviewSubscribe();
  const [subscribeResult, setSubscribeResult] = useState<SubscribeResponseDto | null>(null);
  
  const [checkoutPlan, setCheckoutPlan] = useState<{ planId: string, billingCycle: string, planName: string, basePrice: number, maxUsers?: number, description?: string, isPopular?: boolean } | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [previewResult, setPreviewResult] = useState<PreviewSubscribeResponseDto | null>(null);
  const [promoError, setPromoError] = useState('');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const { data: mySubscription, isLoading: isMySubLoading, isError: isMySubError } = useMySubscription();
  const { data: txStatus } = useTransactionStatus(subscribeResult?.referenceCode || undefined);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (subscribeResult && txStatus !== 'SUCCESS') {
      setRemainingSeconds((subscribeResult as any).remainingSeconds || 600);
    }
  }, [subscribeResult]);

  const cancelTransactionMutation = useCancelTransaction();

  const handleCancelTransaction = async () => {
    if (subscribeResult?.referenceCode) {
      try {
        await cancelTransactionMutation.mutateAsync(subscribeResult.referenceCode);
      } catch (error) {
        console.error("Lỗi khi hủy giao dịch:", error);
      }
    }
    setSubscribeResult(null);
    setRemainingSeconds(null);
  };

  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds(s => {
        if (s && s > 1) return s - 1;
        // Hết giờ -> Hủy giao dịch
        handleCancelTransaction();
        setShowUpgradeModal(false);
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  useEffect(() => {
    if (txStatus === 'SUCCESS' || subscribeResult?.amount === 0) {
      // Khi thành công, dừng đếm ngược
      setRemainingSeconds(null);
      
      // Refresh window after 2 seconds to reload session/permissions
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [txStatus, subscribeResult?.amount]);

  const openCheckout = (plan: any, billingCycle: string, basePrice: number, isPopular: boolean) => {
    setCheckoutPlan({ planId: plan.id, billingCycle, planName: plan.name, basePrice, maxUsers: plan.maxUsers, description: plan.description, isPopular });
    setPromoCode('');
    setPreviewResult(null);
    setPromoError('');
  };

  const handlePreviewDiscount = async (planId: string, billingCycle: string, code: string) => {
    try {
      setPromoError('');
      const res = await previewSubscribeMutation.mutateAsync({ planId, billingCycle, promoCode: code });
      setPreviewResult(res);
    } catch (error: any) {
      setPreviewResult(null);
      if (code) {
        let errorMessage = 'Mã giảm giá không hợp lệ';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          const firstKey = Object.keys(errors)[0];
          if (firstKey && errors[firstKey].length > 0) {
            errorMessage = errors[firstKey][0];
          }
        }
        setPromoError(errorMessage);
      }
    }
  };

  const handleApplyPromo = () => {
    if (checkoutPlan) {
      handlePreviewDiscount(checkoutPlan.planId, checkoutPlan.billingCycle, promoCode);
    }
  };

  const handleConfirmSubscribe = async () => {
    if (!checkoutPlan) return;
    try {
      const res = await subscribeMutation.mutateAsync({ 
        planId: checkoutPlan.planId, 
        billingCycle: checkoutPlan.billingCycle,
        promoCode: promoCode 
      });
      setSubscribeResult(res);
      setCheckoutPlan(null);
    } catch (error: any) {
      console.error('Failed to subscribe', error);
      let errMsg = 'Có lỗi xảy ra khi thực hiện thanh toán';
      if (error.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        if (firstKey && errors[firstKey].length > 0) errMsg = errors[firstKey][0];
      }
      toast.error(errMsg);
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
          
          {/* Minimized QR Widget */}
          {subscribeResult && txStatus !== 'SUCCESS' && subscribeResult.amount !== 0 && !showUpgradeModal && remainingSeconds !== null && remainingSeconds > 0 && (
            <div 
              onClick={() => setShowUpgradeModal(true)}
              className="hidden sm:flex cursor-pointer items-center gap-2 mr-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors shadow-sm"
              title="Bạn có một giao dịch đang chờ thanh toán"
            >
              <QrCode size={16} className="animate-pulse" />
              <span className="text-xs font-bold font-mono">
                {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

          <NotificationBell />
          
          <div ref={menuRef} className="relative">
            <div 
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white font-bold text-xs cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ml-1 border-2 border-white overflow-hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {session?.user?.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={18} />
              )}
            </div>
            
            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute top-14 right-0 w-64 bg-white/95 backdrop-blur-md border border-gray-100/50 rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-4 z-[60]">
                <div className="px-4 py-2 border-b border-gray-50 mb-2">
                  <p className="font-semibold text-sm text-gray-800 truncate">{session?.user?.name || 'Người dùng'}</p>
                  <p className="text-xs text-gray-500 truncate">{session?.user?.email || 'Chưa đăng nhập'}</p>
                </div>
                
                <button 
                  onClick={() => {
                    setMenuOpen(false);
                    if (userRole === 'CENTER_ADMIN') {
                      router.push('/ops/settings#thong-tin-chung');
                    } else {
                      router.push('/me/profile');
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <User size={16} className="text-gray-400" />
                  Thông tin tài khoản
                </button>
                
                {userRole === 'CENTER_ADMIN' && (
                  <button 
                    onClick={() => { setMenuOpen(false); setShowUpgradeModal(true); setSubscribeResult(null); setCheckoutPlan(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-[#2563EB] hover:bg-[#EFF6FF] flex items-center gap-2 font-medium"
                  >
                    <Zap size={16} className="text-[#2563EB]" />
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[900px] overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-start p-8 pb-4 bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Crown size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">Nâng cấp gói dịch vụ</h2>
                  {isMySubLoading ? (
                    <p className="text-sm text-gray-500 mt-1">Đang tải thông tin gói...</p>
                  ) : isMySubError ? (
                    <p className="text-sm text-red-500 mt-1">Lỗi tải thông tin gói</p>
                  ) : mySubscription ? (
                    <p className="text-sm text-gray-500 mt-1">
                      Gói hiện tại: <span className="font-semibold text-blue-600">{mySubscription.planName || 'Chưa rõ'}</span> 
                      {mySubscription.subscriptionEnd && <span className="text-gray-400 mx-2">•</span>}
                      {mySubscription.subscriptionEnd && `Hết hạn: ${new Date(mySubscription.subscriptionEnd).toLocaleDateString('vi-VN')}`}
                    </p>
                  ) : null}
                </div>
              </div>
              <button onClick={() => setShowUpgradeModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-gray-50/50 rounded-b-3xl w-full">
              {subscribeResult || checkoutPlan ? (
                <div className="flex flex-col md:flex-row bg-white rounded-b-3xl">
                {/* Left Sidebar */}
                <div className="w-full md:w-[300px] shrink-0 border-r border-gray-100 bg-gray-50/50 p-8 flex flex-col justify-between rounded-bl-3xl">
                  <div>
                    <div className="relative pl-2">
                      {/* Line connecting steps */}
                      <div className="absolute left-[24px] top-6 bottom-6 w-[2px] bg-gray-200 z-0"></div>
                      
                      <div className="flex gap-4 items-start mb-10 relative z-10 cursor-pointer" onClick={() => { if (!subscribeResult && checkoutPlan) setCheckoutPlan(null); }}>
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm shadow-blue-200">1</div>
                        <div>
                          <p className="font-bold text-blue-600 text-sm">Chọn gói</p>
                          <p className="text-xs text-gray-500 mt-1">Lựa chọn dịch vụ phù hợp</p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start mb-10 relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm transition-colors ${!subscribeResult ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-gray-200 text-gray-500'}`}>
                          2
                        </div>
                        <div>
                          <p className={`font-bold text-sm transition-colors ${!subscribeResult ? 'text-gray-900' : 'text-gray-500'}`}>Xác nhận thanh toán</p>
                          <p className="text-xs text-gray-500 mt-1">Kiểm tra thông tin đơn hàng</p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm transition-colors ${subscribeResult ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-gray-200 text-gray-400'}`}>
                          3
                        </div>
                        <div>
                          <p className={`font-bold text-sm transition-colors ${subscribeResult ? 'text-gray-900' : 'text-gray-400'}`}>Thanh toán</p>
                          <p className="text-xs text-gray-400 mt-1">Hoàn tất nâng cấp gói</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 bg-white rounded-xl p-4 border border-blue-100 flex gap-3 items-start shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                    <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[12px] font-bold text-gray-900">Thanh toán an toàn & bảo mật</p>
                      <p className="text-[11px] text-gray-500 mt-1">Thông tin của bạn luôn được bảo vệ tuyệt đối.</p>
                    </div>
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
                  {subscribeResult ? (
                     // QR Code section
                     <div className="flex flex-col items-center justify-center text-center">
                       {txStatus === 'SUCCESS' || subscribeResult.amount === 0 ? (
                         <div className="text-green-500 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                           <CheckCircle2 size={64} className="mb-4" />
                           <h3 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h3>
                           <p className="text-gray-600">Gói cước đã được kích hoạt. Đang làm mới hệ thống...</p>
                         </div>
                       ) : (
                         <>
                           <h3 className="text-xl font-bold text-gray-900 mb-2">Quét mã QR để thanh toán</h3>
                           <p className="text-gray-500 mb-6 text-sm">Mã giao dịch: <strong className="text-gray-800">{subscribeResult.referenceCode}</strong></p>
                           
                           {remainingSeconds !== null && (
                             <div className="flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-4 py-1.5 rounded-full mb-6 text-sm shadow-sm">
                               <Clock size={16} className="animate-pulse" />
                               <span>Hết hạn trong: {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}</span>
                             </div>
                           )}

                           {subscribeResult.qrCodeUrl ? (
                              <img src={subscribeResult.qrCodeUrl} alt="QR Code" className="w-64 h-64 rounded-2xl border-4 border-gray-50 shadow-lg mb-8" />
                           ) : (
                              <div className="w-64 h-64 rounded-2xl border-4 border-gray-50 shadow-lg mb-8 flex items-center justify-center bg-gray-50 text-gray-400">Đang tải mã QR...</div>
                           )}
                           
                           <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-[13px] p-4 rounded-xl flex items-start gap-3 max-w-md text-left leading-relaxed">
                             <div className="animate-spin mt-0.5 rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent shrink-0"></div>
                             <p>Hệ thống đang chờ xác nhận thanh toán từ ngân hàng. Bạn có thể thu nhỏ cửa sổ này và làm việc khác, giao dịch vẫn được giữ trong thời gian đếm ngược.</p>
                           </div>
                           
                           <button 
                             onClick={handleCancelTransaction} 
                             disabled={cancelTransactionMutation.isPending}
                             className="mt-8 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-full transition-colors font-semibold disabled:opacity-50"
                           >
                             {cancelTransactionMutation.isPending ? 'Đang hủy...' : 'Hủy giao dịch'}
                           </button>
                         </>
                       )}
                     </div>
                  ) : checkoutPlan ? (
                     // Checkout section
                     <div className="max-w-[480px] mx-auto w-full">
                       <h3 className="text-lg font-bold text-gray-900 mb-6">Xác nhận thanh toán</h3>
                       
                       <div className="border border-gray-200 rounded-2xl p-6 mb-8 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                         <div className="flex justify-between items-start mb-6 gap-4">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                               {checkoutPlan.isPopular ? <Gem size={22} /> : <Send size={22} />}
                             </div>
                             <div>
                               <div className="flex items-center gap-2">
                                 <h4 className="font-bold text-gray-900 text-[15px]">Gói {checkoutPlan.planName}</h4>
                                 {checkoutPlan.isPopular && (
                                   <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Phổ biến</span>
                                 )}
                               </div>
                               <p className="text-[13px] text-gray-500 mt-1 line-clamp-1">{checkoutPlan.description || 'Gói cước cơ bản'}</p>
                             </div>
                           </div>
                           <div className="text-right shrink-0">
                             <p className="text-lg font-extrabold text-gray-900">{checkoutPlan.basePrice.toLocaleString('vi-VN')} <span className="text-xs font-medium text-gray-500 font-normal">đ/{checkoutPlan.billingCycle === 'MONTHLY' ? 'tháng' : 'năm'}</span></p>
                           </div>
                         </div>

                         <div className="border-t border-gray-100/60 pt-4 space-y-2.5">
                           <div className="flex items-center gap-3 text-[13px] font-medium text-gray-700">
                             <div className="rounded-full p-0.5 shrink-0 bg-blue-600 text-white">
                               <CheckCircle2 size={12} strokeWidth={3} />
                             </div>
                             <span>Tối đa <strong>{checkoutPlan.maxUsers}</strong> người dùng</span>
                           </div>
                           {checkoutPlan.description && checkoutPlan.description.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                             <div key={i} className="flex items-center gap-3 text-[13px] font-medium text-gray-700">
                               <div className="rounded-full p-0.5 shrink-0 bg-blue-600 text-white">
                                 <CheckCircle2 size={12} strokeWidth={3} />
                               </div>
                               <span>{line}</span>
                             </div>
                           ))}
                         </div>
                       </div>

                       <div className="mb-8">
                         <label className="block text-[13px] font-bold text-gray-700 mb-2">Mã giảm giá (nếu có)</label>
                         <div className="flex gap-2">
                           <Input 
                             value={promoCode} 
                             onChange={(e) => setPromoCode(e.target.value)}
                             placeholder="Nhập mã giảm giá..." 
                             className="flex-1 h-11 rounded-xl text-sm"
                           />
                           <button 
                             onClick={handleApplyPromo}
                             disabled={!promoCode || previewSubscribeMutation.isPending}
                             className="px-5 h-11 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-[13px] rounded-xl transition-colors disabled:opacity-50 border border-gray-200 shadow-sm"
                           >
                             Áp dụng
                           </button>
                         </div>
                         {promoError && <p className="text-xs text-red-500 mt-2 font-medium">{promoError}</p>}
                         {previewResult && previewResult.discountAmount > 0 && (
                           <div className="mt-3 p-2.5 bg-green-50 text-green-700 rounded-xl text-xs flex justify-between items-center border border-green-100">
                             <p className="font-bold">Đã áp dụng mã giảm giá {previewResult.appliedPromotionCode || ''}</p>
                             <p className="font-bold">- {previewResult.discountAmount.toLocaleString('vi-VN')} đ</p>
                           </div>
                         )}
                       </div>

                       <div className="border-t border-gray-100/60 pt-6 mb-6 space-y-3">
                         <div className="flex justify-between items-center">
                           <p className="text-sm font-medium text-gray-500">Tạm tính</p>
                           <p className="text-sm font-bold text-gray-900">{checkoutPlan.basePrice.toLocaleString('vi-VN')} đ</p>
                         </div>
                         <div className="flex justify-between items-center">
                           <p className="text-sm font-medium text-gray-500">Giảm giá</p>
                           <p className="text-sm font-bold text-green-500">-{previewResult ? previewResult.discountAmount.toLocaleString('vi-VN') : '0'} đ</p>
                         </div>
                         
                         <div className="flex justify-between items-end border-t border-gray-100/60 pt-4 mt-2">
                           <p className="text-[15px] font-bold text-gray-900 mb-0.5">Tổng thanh toán</p>
                           <p className="text-2xl font-extrabold text-blue-600">
                             {previewResult ? previewResult.finalPrice.toLocaleString('vi-VN') : checkoutPlan.basePrice.toLocaleString('vi-VN')} đ
                           </p>
                         </div>
                       </div>
                       
                       <button 
                         onClick={handleConfirmSubscribe}
                         disabled={subscribeMutation.isPending || previewSubscribeMutation.isPending}
                         className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] transition-colors shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] disabled:opacity-50 flex items-center justify-center gap-2 group"
                       >
                         {subscribeMutation.isPending ? 'Đang tạo đơn...' : 'Xác nhận & Thanh toán'}
                         {!subscribeMutation.isPending && <Lock size={16} className="opacity-80" />}
                       </button>
                       <p className="text-center text-[11px] text-gray-500 mt-4">
                         Bằng cách tiếp tục, bạn đồng ý với <a href="#" className="text-blue-600 hover:underline font-medium">Điều khoản dịch vụ</a>
                       </p>
                     </div>
                  ) : null}
                </div>
              </div>
            ) : isPlansLoading ? (
                <div className="text-center py-10 text-gray-500">Đang tải danh sách gói cước...</div>
              ) : (
                <div className="max-w-[800px] mx-auto p-6 pb-10">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-8 mt-4 px-4 sm:px-10 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Tag size={16} />
                      Chu kỳ thanh toán
                    </div>
                    <div className="bg-white p-1 rounded-full flex items-center relative border border-gray-200">
                      <button
                        onClick={() => setBillingCycle('MONTHLY')}
                        className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                          billingCycle === 'MONTHLY' ? 'text-blue-700' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Thanh toán Tháng
                      </button>
                      <button
                        onClick={() => setBillingCycle('YEARLY')}
                        className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                          billingCycle === 'YEARLY' ? 'text-blue-700' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Thanh toán Năm
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${billingCycle === 'YEARLY' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          -20%
                        </span>
                      </button>
                      
                      {/* Active Indicator Slider */}
                      <div 
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full border border-blue-600 shadow-sm transition-transform duration-300 ease-out z-0"
                        style={{ transform: billingCycle === 'YEARLY' ? 'translateX(100%)' : 'translateX(0)' }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 sm:px-10">
                    {plans?.map((plan) => {
                      const isCurrentPlan = mySubscription && mySubscription.planId === plan.id;
                      const getRemainingDays = () => {
                        if (!mySubscription?.subscriptionEnd) return Infinity;
                        const end = new Date(mySubscription.subscriptionEnd);
                        const now = new Date();
                        const diffTime = end.getTime() - now.getTime();
                        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      };
                      const remainingDays = getRemainingDays();
                      const isNearExpiry = remainingDays <= 7;
                      const isPopular = plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('premium');
                      const hasDiscount = plan.activeDiscountPercentage && plan.activeDiscountPercentage > 0;
                      
                      const basePrice = billingCycle === 'MONTHLY' ? plan.pricePerMonth : (plan.pricePerYear || plan.pricePerMonth * 12 * 0.8);
                      const finalPrice = (hasDiscount && plan.activeDiscountPercentage) ? basePrice * (1 - plan.activeDiscountPercentage / 100) : basePrice;

                      return (
                        <div 
                          key={plan.id} 
                          className={`relative rounded-3xl bg-white flex flex-col h-full transition-all duration-300 ${
                            isPopular 
                              ? 'border-2 border-blue-600 shadow-[0_8px_30px_rgb(0,0,0,0.08)] md:-translate-y-2 z-10 pt-10 px-8 pb-8' 
                              : 'border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.04)] hover:shadow-lg pt-10 px-8 pb-8'
                          }`}
                        >
                          {isPopular && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm uppercase tracking-wider flex items-center gap-1.5">
                              <Star size={14} fill="currentColor" /> PHỔ BIẾN
                            </div>
                          )}
                          
                          <div className="flex justify-center mb-5">
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                              {isPopular ? <Gem size={28} /> : <Send size={28} />}
                            </div>
                          </div>

                          <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                            {plan.description && <p className="text-sm text-gray-500 line-clamp-2 px-6">{plan.description}</p>}
                          </div>

                          <div className="flex flex-col items-center justify-center gap-1 mb-8">
                            {hasDiscount && (
                              <span className="text-sm font-medium text-gray-400 line-through">
                                {basePrice.toLocaleString('vi-VN')}đ
                              </span>
                            )}
                            <div className="flex items-end gap-1">
                              <span className={`text-[44px] leading-none font-extrabold tracking-tight ${hasDiscount ? 'text-rose-600' : (isPopular ? 'text-blue-600' : 'text-gray-900')}`}>
                                {finalPrice.toLocaleString('vi-VN')}
                              </span>
                              <span className="text-gray-500 font-medium mb-1.5 text-sm">đ/{billingCycle === 'MONTHLY' ? 'tháng' : 'năm'}</span>
                            </div>
                          </div>
                          
                          <ul className="space-y-4 mb-10 flex-1 px-4 border-t border-gray-100/60 pt-6">
                            <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                              <div className={`rounded-full p-0.5 shrink-0 ${isPopular ? 'bg-blue-600 text-white' : 'border border-blue-600 text-blue-600 bg-white'}`}>
                                <CheckCircle2 size={16} className={isPopular ? "" : "w-3 h-3 m-[1px]"} strokeWidth={3} />
                              </div>
                              <span>Tối đa <strong>{plan.maxUsers}</strong> người dùng</span>
                            </li>
                            {plan.description && plan.description.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                                <div className={`rounded-full p-0.5 shrink-0 ${isPopular ? 'bg-blue-600 text-white' : 'border border-gray-400 text-gray-400 bg-white'}`}>
                                  <CheckCircle2 size={16} className={isPopular ? "" : "w-3 h-3 m-[1px]"} strokeWidth={3} />
                                </div>
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="mt-auto">
                            {isCurrentPlan ? (
                              isNearExpiry ? (
                                <button 
                                  onClick={() => openCheckout(plan, billingCycle, basePrice, isPopular)}
                                  className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                                >
                                  Gia hạn gói ({billingCycle === 'MONTHLY' ? 'Tháng' : 'Năm'})
                                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                              ) : (
                                <div className="w-full py-3.5 rounded-full bg-green-50 text-green-700 font-bold text-sm text-center flex items-center justify-center gap-2 border border-green-100">
                                  <CheckCircle2 size={18} />
                                  Đang sử dụng
                                </div>
                              )
                            ) : (
                              <button 
                                onClick={() => openCheckout(plan, billingCycle, basePrice, isPopular)}
                                className={`w-full py-3.5 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 group ${
                                  isPopular 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]' 
                                    : 'bg-[#293E63] hover:bg-[#1E2E4B] text-white shadow-md'
                                }`}
                              >
                                {isPopular ? `Đăng ký gói ${billingCycle === 'MONTHLY' ? 'Tháng' : 'Năm'}` : 'Nâng cấp gói'}
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-12 flex items-center justify-center gap-2 text-[13px] text-blue-600 font-medium">
                    <ShieldCheck size={16} className="shrink-0" />
                    <span>Thanh toán an toàn & bảo mật. Bạn có thể nâng cấp, hạ gói hoặc hủy bất kỳ lúc nào.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
