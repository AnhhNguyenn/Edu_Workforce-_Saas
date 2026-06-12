'use client';

import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/ui/stat-card';
import { Search, Menu, LogOut, User, Zap, X, CheckCircle2 } from 'lucide-react';
import { NotificationBell } from './notification-bell';
import { useSignalR } from '@/lib/useSignalR';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { usePlans, useSubscribe, usePreviewSubscribe, useTransactionStatus, SubscribeResponseDto, PreviewSubscribeResponseDto, useMySubscription } from '@/hooks/queries/useSubscriptions';

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
  const previewSubscribeMutation = usePreviewSubscribe();
  const [subscribeResult, setSubscribeResult] = useState<SubscribeResponseDto | null>(null);
  
  const [checkoutPlan, setCheckoutPlan] = useState<{ planId: string, billingCycle: string, planName: string, basePrice: number } | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [previewResult, setPreviewResult] = useState<PreviewSubscribeResponseDto | null>(null);
  const [promoError, setPromoError] = useState('');

  const { data: mySubscription } = useMySubscription();
  const { data: txStatus } = useTransactionStatus(subscribeResult?.referenceCode || null);

  useEffect(() => {
    if (txStatus === 'PAID') {
      // Refresh window after 2 seconds to reload session/permissions
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [txStatus]);

  const openCheckout = (planId: string, billingCycle: string, planName: string, basePrice: number) => {
    setCheckoutPlan({ planId, billingCycle, planName, basePrice });
    setPromoCode('');
    setPreviewResult(null);
    setPromoError('');
    // Automatically preview without promo code to get any active auto discounts
    handlePreviewDiscount(planId, billingCycle, '');
  };

  const handlePreviewDiscount = async (planId: string, billingCycle: string, code: string) => {
    try {
      setPromoError('');
      const res = await previewSubscribeMutation.mutateAsync({ planId, billingCycle, promoCode: code });
      setPreviewResult(res);
    } catch (error: any) {
      setPreviewResult(null);
      if (code) {
        setPromoError(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
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
                    onClick={() => { setMenuOpen(false); setShowUpgradeModal(true); setSubscribeResult(null); setCheckoutPlan(null); }}
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
              <div>
                <h2 className="text-xl font-bold text-gray-800">Nâng cấp gói dịch vụ</h2>
                {mySubscription && (
                  <p className="text-sm text-gray-500 mt-1">
                    Gói hiện tại: <span className="font-semibold text-edu-accent">{mySubscription.planName}</span> 
                    {mySubscription.subscriptionEnd && ` • Hết hạn: ${new Date(mySubscription.subscriptionEnd).toLocaleDateString('vi-VN')}`}
                  </p>
                )}
              </div>
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
              ) : checkoutPlan ? (
                  <div className="max-w-2xl mx-auto py-4">
                    <button 
                      onClick={() => setCheckoutPlan(null)}
                      className="text-sm text-edu-muted hover:text-edu-fg flex items-center gap-1 mb-6"
                    >
                      &larr; Quay lại chọn gói
                    </button>
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">Xác nhận thanh toán</h3>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="font-medium text-gray-800">Gói {checkoutPlan.planName}</p>
                          <p className="text-sm text-gray-500">Chu kỳ: {checkoutPlan.billingCycle === 'MONTHLY' ? 'Hàng tháng' : 'Hàng năm'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">{(checkoutPlan.billingCycle === 'MONTHLY' ? checkoutPlan.basePrice : checkoutPlan.basePrice * 12).toLocaleString('vi-VN')} đ</p>
                        </div>
                      </div>

                      <div className="mt-6 border-t border-b py-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mã giảm giá</label>
                        <div className="flex gap-2">
                          <Input 
                            value={promoCode} 
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Nhập mã giảm giá..." 
                            className="flex-1"
                          />
                          <button 
                            onClick={handleApplyPromo}
                            disabled={!promoCode || previewSubscribeMutation.isPending}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            Áp dụng
                          </button>
                        </div>
                        {promoError && <p className="text-sm text-red-500 mt-2">{promoError}</p>}
                        
                        {previewResult && previewResult.discountAmount > 0 && (
                          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm flex justify-between items-center border border-green-100">
                            <div>
                              <p className="font-medium">Đã áp dụng mã giảm giá {previewResult.appliedPromotionCode}</p>
                            </div>
                            <p className="font-bold">- {previewResult.discountAmount.toLocaleString('vi-VN')} đ</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-6">
                          <p className="text-lg font-bold text-gray-800">Tổng thanh toán</p>
                          <p className="text-2xl font-extrabold text-edu-accent">
                            {previewResult ? previewResult.finalPrice.toLocaleString('vi-VN') : (checkoutPlan.billingCycle === 'MONTHLY' ? checkoutPlan.basePrice : checkoutPlan.basePrice * 12).toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                        
                        <button 
                          onClick={handleConfirmSubscribe}
                          disabled={subscribeMutation.isPending || previewSubscribeMutation.isPending}
                          className="w-full py-3.5 rounded-lg bg-edu-accent hover:bg-blue-600 text-white font-bold text-lg transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {subscribeMutation.isPending ? 'Đang tạo đơn...' : 'Xác nhận & Thanh toán'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : isPlansLoading ? (
                <div className="text-center py-10 text-gray-500">Đang tải danh sách gói cước...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                    return (
                      <div key={plan.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
                        {plan.activeDiscountPercentage && plan.activeDiscountPercentage > 0 ? (
                          <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                            Giảm {plan.activeDiscountPercentage}%
                          </div>
                        ) : plan.pricePerMonth > 0 && (
                          <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                            Nổi bật
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-6 flex-wrap">
                          {plan.activeDiscountPercentage && plan.activeDiscountPercentage > 0 ? (
                            <>
                              <div className="w-full flex items-center gap-2 mb-1">
                                <span className="text-xl font-medium text-gray-400 line-through">{plan.pricePerMonth.toLocaleString('vi-VN')}đ</span>
                              </div>
                              <span className="text-3xl font-extrabold text-red-600">
                                {(plan.pricePerMonth * (1 - plan.activeDiscountPercentage / 100)).toLocaleString('vi-VN')}đ
                              </span>
                            </>
                          ) : (
                            <span className="text-3xl font-extrabold text-gray-900">{plan.pricePerMonth.toLocaleString('vi-VN')}đ</span>
                          )}
                          <span className="text-gray-500 text-sm">/tháng</span>
                        </div>
                        
                        <ul className="space-y-3 mb-8 flex-1">
                          <li className="flex gap-2 text-sm text-gray-600"><CheckCircle2 size={18} className="text-green-500 shrink-0" /> Tối đa {plan.maxUsers} người dùng</li>
                          {plan.description && plan.description.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                            <li key={i} className="flex gap-2 text-sm text-gray-600">
                              <CheckCircle2 size={18} className="text-green-500 shrink-0" /> 
                              {line}
                            </li>
                          ))}
                        </ul>
                        
                        <div className="space-y-2 mt-auto">
                          {isCurrentPlan ? (
                            isNearExpiry ? (
                              <>
                                <button 
                                  onClick={() => openCheckout(plan.id, 'MONTHLY', plan.name, plan.pricePerMonth)}
                                  className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5"
                                >
                                  Gia hạn Gói Tháng
                                </button>
                                <button 
                                  onClick={() => openCheckout(plan.id, 'YEARLY', plan.name, plan.pricePerMonth)}
                                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-edu-accent to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm transition-colors shadow-md flex items-center justify-center gap-1.5"
                                >
                                  Nâng cấp / Gia hạn Gói Năm
                                </button>
                              </>
                            ) : (
                              <div className="w-full py-3 rounded-lg bg-gray-100 text-gray-500 font-semibold text-sm text-center border border-gray-200 flex items-center justify-center gap-1.5 select-none">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Đang sử dụng
                              </div>
                            )
                          ) : (
                            <>
                              <button 
                                onClick={() => openCheckout(plan.id, 'MONTHLY', plan.name, plan.pricePerMonth)}
                                className="w-full py-2.5 rounded-lg bg-edu-accent hover:bg-blue-600 text-white font-medium text-sm transition-colors shadow-sm"
                              >
                                Đăng ký Gói Tháng
                              </button>
                              <button 
                                onClick={() => openCheckout(plan.id, 'YEARLY', plan.name, plan.pricePerMonth)}
                                className="w-full py-2.5 rounded-lg border border-edu-accent text-edu-accent hover:bg-edu-accentLight font-medium text-sm transition-colors"
                              >
                                Đăng ký Gói Năm (Tiết kiệm)
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
