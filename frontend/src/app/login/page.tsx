'use client';

import { useState, Suspense, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, BookOpen, ArrowLeft, Mail, KeyRound, Users, BarChart2, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import axios from 'axios';
import { ENV } from '@/config/env';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import bgImage from '../../../public/nenlogin.png';
import logoImage from '../../../public/logo.png';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
});

const otpSchema = z.object({
  otp: z.string().length(6, 'Mã OTP phải có 6 chữ số')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Vui lòng nhập mã xác nhận'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
});

type LoginFormValues = z.infer<typeof loginSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

interface BrandingConfig {
  organizationName?: string;
  customAppName?: string;
  customLogoUrl?: string;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(searchParams.get('error'));

  // Đọc flash message từ cookie để không lộ trên URL
  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const authErrorCookie = cookies.find(row => row.startsWith('auth_error='));
    if (authErrorCookie) {
      const value = authErrorCookie.split('=')[1];
      if (value === 'access-denied') {
        setErrorMsg('access-denied');
      }
      // Xóa cookie ngay lập tức để không hiện lại nếu người dùng F5
      document.cookie = 'auth_error=; path=/; max-age=0';
    }

    // Xóa query param error khỏi URL để khi User F5 không bị lặp lại lỗi
    if (searchParams.has('error')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  }, [searchParams]);

  const [branding, setBranding] = useState<BrandingConfig | null>(null);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const domain = window.location.hostname;
        const res = await axios.get(`${ENV.API_URL}/organizations/branding?domain=${domain}`);
        setBranding(res.data);
      } catch (err) {
      }
    };
    fetchBranding();
  }, []);

  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  
  // Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter token & new pass
  const [forgotEmail, setForgotEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const { register: registerOtp, handleSubmit: handleSubmitOtp, formState: { errors: otpErrors }, watch } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema)
  });
  
  const { register: registerForgot, handleSubmit: handleSubmitForgot, formState: { errors: forgotErrors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const { register: registerReset, handleSubmit: handleSubmitReset, formState: { errors: resetErrors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const otpValue = watch('otp') || '';

  const onLoginSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError('');
    
    // Clear URL error on new attempt
    if (errorMsg) {
      setErrorMsg(null);
      window.history.replaceState(null, '', '/login');
    }

    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.startsWith('2FA_REQUIRED:')) {
          setTempToken(res.error.split(':')[1]);
          setRequires2FA(true);
        } else {
          setError('Sai email hoặc mật khẩu!');
        }
      } else if (res?.ok) {
        window.location.href = '/';
      }
    } catch (err) {
      setError('Đã xảy ra lỗi hệ thống!');
    } finally {
      setLoading(false);
    }
  };

  const onVerifySubmit = async (data: OtpFormValues) => {
    setLoading(true);
    setError('');

    try {
      const verifyRes = await axios.post(`${ENV.API_URL}/auth/verify-2fa`, {
        tempToken,
        otpCode: data.otp
      });

      const responseData = verifyRes.data;
      
      const signInRes = await signIn('credentials', {
        accessToken: responseData.accessToken,
        refreshToken: responseData.refreshToken,
        userStr: JSON.stringify(responseData.user),
        redirect: false
      });

      if (signInRes?.ok) {
        window.location.href = '/';
      } else {
        setError('Không thể lưu phiên đăng nhập!');
      }
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        setError('Mã OTP không đúng hoặc đã hết hạn.');
      } else {
        setError('Đã xảy ra lỗi hệ thống!');
      }
    } finally {
      setLoading(false);
    }
  };

  const onForgotSubmit = async (data: ForgotPasswordValues) => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${ENV.API_URL}/auth/forgot-password`, { email: data.email });
      setForgotEmail(data.email);
      setForgotStep(2);
      toast.success('Mã xác nhận đã được gửi đến email của bạn!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordValues) => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${ENV.API_URL}/auth/reset-password`, { 
        token: data.token,
        newPassword: data.newPassword 
      });
      toast.success('Khôi phục mật khẩu thành công! Vui lòng đăng nhập lại.');
      setIsForgotPassword(false);
      setForgotStep(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã xác nhận không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const renderForgotPassword = () => {
    if (forgotStep === 1) {
      return (
        <form onSubmit={handleSubmitForgot(onForgotSubmit)} className="space-y-5 animate-in fade-in duration-200">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-full mx-auto flex items-center justify-center text-edu-accent mb-3">
              <Mail size={24} />
            </div>
            <h2 className="text-xl font-bold text-edu-fg">Quên mật khẩu</h2>
            <p className="text-edu-muted text-sm mt-1">Nhập email của bạn để nhận mã khôi phục mật khẩu.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Email của bạn</label>
            <Input 
              type="email" 
              placeholder="example@gmail.com" 
              {...registerForgot('email')}
              error={forgotErrors.email?.message}
            />
          </div>
          {error && <p className="text-edu-danger text-sm font-medium text-center">{error}</p>}
          <Button type="submit" className="w-full text-base py-3" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Gửi mã xác nhận'}
          </Button>
          <button 
            type="button" 
            onClick={() => { setIsForgotPassword(false); setError(''); }}
            className="flex items-center justify-center gap-2 w-full text-sm font-medium text-edu-muted hover:text-edu-accent transition-colors mt-2"
          >
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </button>
        </form>
      );
    }

    return (
      <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-5 animate-in slide-in-from-right duration-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-50 rounded-full mx-auto flex items-center justify-center text-edu-success mb-3">
            <KeyRound size={24} />
          </div>
          <h2 className="text-xl font-bold text-edu-fg">Tạo mật khẩu mới</h2>
          <p className="text-edu-muted text-sm mt-1">Mã xác nhận đã được gửi đến: <span className="font-semibold text-edu-fg">{forgotEmail}</span></p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Mã xác nhận (Từ Email)</label>
          <Input 
            type="text" 
            placeholder="Nhập mã xác nhận..." 
            {...registerReset('token')}
            error={resetErrors.token?.message}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Mật khẩu mới</label>
          <Input 
            type="password" 
            placeholder="Nhập mật khẩu mới..." 
            {...registerReset('newPassword')}
            error={resetErrors.newPassword?.message}
          />
        </div>
        {error && <p className="text-edu-danger text-sm font-medium text-center">{error}</p>}
        <Button type="submit" className="w-full text-base py-3 bg-edu-success hover:bg-edu-success/90" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </Button>
        <button 
          type="button" 
          onClick={() => { setForgotStep(1); setError(''); }}
          className="flex items-center justify-center gap-2 w-full text-sm font-medium text-edu-muted hover:text-edu-accent transition-colors mt-2"
        >
          <ArrowLeft size={16} /> Trở về nhập lại Email
        </button>
      </form>
    );
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 md:p-12 font-sans bg-white"
      style={{ backgroundImage: `url(${bgImage.src})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
    >
      {/* Top Left Logo */}
      <div className="absolute top-8 left-8 md:top-10 md:left-12 flex items-center gap-3 z-50">
        <img 
          src={branding?.customLogoUrl || logoImage.src} 
          alt="Logo" 
          className="w-10 h-10 object-contain drop-shadow-sm" 
          onError={(e) => { e.currentTarget.src = logoImage.src; }}
        />
        <span className="text-xl font-bold tracking-tight text-slate-900">EduOps</span>
      </div>

      <div className="w-full max-w-[1320px] flex relative z-10 items-center justify-between gap-12 lg:gap-24">
        {/* Left Side (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col justify-center w-[50%] relative py-12">
          <div className="mb-12">
            <h1 className="text-5xl font-extrabold text-slate-900 leading-[1.1] mb-4 tracking-tight">
              Chào mừng <br />
              <span className="text-blue-600">trở lại!</span>
            </h1>
            <p className="text-base text-slate-500 leading-relaxed max-w-sm">
              Đăng nhập để tiếp tục quản lý trung tâm và giáo viên một cách hiệu quả.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-[0_4px_20px_rgba(37,99,235,0.08)] flex items-center justify-center text-[#2563EB]">
                <Users size={22} />
              </div>
              <div>
                <h3 className="font-bold text-[#1E293B] text-[15px] mb-0.5">Quản lý tập trung</h3>
                <p className="text-gray-500 text-[13px]">Dễ dàng quản lý mọi hoạt động</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-[0_4px_20px_rgba(37,99,235,0.08)] flex items-center justify-center text-[#2563EB]">
                <BarChart2 size={22} />
              </div>
              <div>
                <h3 className="font-bold text-[#1E293B] text-[15px] mb-0.5">Hiệu quả vượt trội</h3>
                <p className="text-gray-500 text-[13px]">Tối ưu quy trình vận hành</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-[0_4px_20px_rgba(37,99,235,0.08)] flex items-center justify-center text-[#2563EB]">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="font-bold text-[#1E293B] text-[15px] mb-0.5">Bảo mật tuyệt đối</h3>
                <p className="text-gray-500 text-[13px]">Dữ liệu được bảo vệ an toàn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="w-full lg:w-[50%] flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[520px] bg-white/80 backdrop-blur-md rounded-[36px] p-10 sm:p-14 shadow-[0_24px_80px_rgba(0,0,0,0.06)] border border-white/60">
            {/* Header */}
            <div className="flex flex-col items-center mb-10 text-center">
            <img 
              src={branding?.customLogoUrl || logoImage.src} 
              alt="Logo" 
              className="w-16 h-16 object-contain mb-6 drop-shadow-sm" 
              onError={(e) => { e.currentTarget.src = logoImage.src; }}
            />
              <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                Đăng nhập
              </h2>
              <p className="text-sm text-slate-500">Hệ thống quản lý trung tâm & giáo viên</p>
            </div>

            {/* Error Message */}
            {(errorMsg || error) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col items-center text-center">
                <span className="text-sm text-red-600 font-medium">
                  {error || (errorMsg === 'CredentialsSignin' ? 'Email hoặc mật khẩu không chính xác' : 
                           errorMsg === 'access-denied' ? 'Tài khoản của bạn đã bị khóa hoặc không có quyền truy cập.' : 
                           'Đã có lỗi xảy ra. Vui lòng thử lại.')}
                </span>
              </div>
            )}

            {!isForgotPassword ? (
              <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-[#1E293B] mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute top-0 left-0 h-12 pl-4 flex items-center pointer-events-none text-gray-400 z-10">
                      <Mail size={18} />
                    </div>
                    <Input 
                      type="email" 
                      placeholder="Nhập email của bạn" 
                      className="pl-11 h-12 bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 rounded-[12px] text-[14px] transition-all"
                      {...registerLogin('email')}
                      error={loginErrors.email?.message}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[13px] font-bold text-[#1E293B]">Mật khẩu</label>
                    <button 
                      type="button" 
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[12px] text-[#2563EB] font-semibold hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute top-0 left-0 h-12 pl-4 flex items-center pointer-events-none text-gray-400 z-10">
                      <Lock size={18} />
                    </div>
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Nhập mật khẩu" 
                      className="pl-11 pr-11 h-12 bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 rounded-[12px] text-[14px] transition-all"
                      {...registerLogin('password')}
                      error={loginErrors.password?.message}
                    />
                    <button 
                      type="button" 
                      className="absolute top-0 right-0 h-12 pr-4 flex items-center text-gray-400 hover:text-gray-600 z-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center pt-1">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-[#2563EB] focus:ring-[#2563EB] border-gray-300 rounded cursor-pointer"
                    defaultChecked
                  />
                  <label htmlFor="remember" className="ml-3 block text-[13px] text-gray-700 font-semibold cursor-pointer">
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                {error && <p className="text-red-500 text-[13px] font-medium text-center bg-red-50 p-2 rounded-lg">{error}</p>}

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-[15px] shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                  {!loading && <ArrowRight size={18} />}
                </Button>

                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center justify-center gap-1.5 text-[13px] text-gray-500 font-medium text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={16} className="text-[#2563EB]" />
                    <span>Hệ thống chỉ dành cho quản trị viên được ủy quyền</span>
                  </div>
                  <p className="text-[13px] text-gray-400">
                    Nếu chưa có tài khoản, vui lòng <a href="#" className="text-[#2563EB] hover:underline font-semibold transition-colors">liên hệ ngay với chúng tôi</a>
                  </p>
                </div>
              </form>
            ) : (
              renderForgotPassword()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
