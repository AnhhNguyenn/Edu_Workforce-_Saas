'use client';

import { useState, Suspense, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, BookOpen, ArrowLeft, Mail, KeyRound } from 'lucide-react';
import axios from 'axios';
import { ENV } from '@/config/env';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';

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

  const [branding, setBranding] = useState<{ organizationName?: string, customAppName?: string, customLogoUrl?: string } | null>(null);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const domain = window.location.hostname;
        // Chỉ fetch nếu domain khác localhost (trừ khi đang test local bằng IP)
        // Nhưng cứ để fetch luôn, backend sẽ trả về 404 nếu không tìm thấy
        const res = await axios.get(`${ENV.API_URL}/organizations/branding?domain=${domain}`);
        setBranding(res.data);
      } catch (err) {
        // Bỏ qua lỗi
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
      
      // Save token to NextAuth
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg border border-edu-border">
        {!isForgotPassword && (
          <div className="text-center mb-8">
            {branding?.customLogoUrl ? (
              <img src={branding.customLogoUrl} alt="Logo" className="h-16 w-auto max-w-[200px] object-contain mx-auto mb-4" />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-edu-accent to-[#7BC4FF] rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-sm">
                <BookOpen size={28} />
              </div>
            )}
            <h1 className="text-2xl font-bold text-edu-fg">Đăng nhập {branding?.customAppName || branding?.organizationName || 'EduOps'}</h1>
            <p className="text-edu-muted text-sm mt-2">Hệ thống quản lý trung tâm & giáo viên</p>
          </div>
        )}

        {errorMsg && !isForgotPassword && (
          <div className="bg-edu-dangerLight text-edu-danger p-3 rounded-lg text-sm mb-4 text-center font-medium">
            {errorMsg === 'access-denied' 
              ? 'Bạn không có quyền truy cập trang này!' 
              : (errorMsg === 'session_expired' || errorMsg === 'SessionExpired')
              ? 'Phiên đăng nhập đã hết hạn hoặc tài khoản vừa đăng nhập trên thiết bị khác. Vui lòng đăng nhập lại!'
              : 'Sai email hoặc mật khẩu (hoặc tài khoản đã bị khóa)!'}
          </div>
        )}

        {isForgotPassword ? (
          renderForgotPassword()
        ) : requires2FA ? (
          <form method="POST" onSubmit={handleSubmitOtp(onVerifySubmit)} className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-2">
              <ShieldCheck className="mx-auto text-edu-success mb-2" size={32} />
              <p className="text-sm text-edu-fgSecondary font-medium">Bảo mật 2 lớp (2FA) đã được bật. Vui lòng nhập mã OTP từ ứng dụng Authenticator của bạn.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5 text-center">Mã OTP (6 số)</label>
              <Input 
                type="text" 
                placeholder="123456" 
                className="text-center text-xl tracking-[0.5em] font-bold"
                maxLength={6}
                {...registerOtp('otp')}
                error={otpErrors.otp?.message}
              />
            </div>
            
            {error && <p className="text-edu-danger text-sm font-medium text-center">{error}</p>}

            <Button type="submit" className="w-full text-base py-3" disabled={loading || otpValue.length !== 6}>
              {loading ? 'Đang xác minh...' : 'Xác minh'}
            </Button>
            <div className="text-center">
              <button type="button" onClick={() => setRequires2FA(false)} className="text-xs text-edu-muted hover:text-edu-accent underline">Quay lại đăng nhập</button>
            </div>
          </form>
        ) : (
          <form method="POST" onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Email</label>
              <Input 
                type="email" 
                placeholder="Nhập địa chỉ email..." 
                {...registerLogin('email')}
                error={loginErrors.email?.message}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-edu-fgSecondary">Mật khẩu</label>
                <button 
                  type="button" 
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs text-edu-accent font-medium hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <Input 
                type="password" 
                placeholder="Nhập mật khẩu..." 
                {...registerLogin('password')}
                error={loginErrors.password?.message}
              />
            </div>

            {error && <p className="text-edu-danger text-sm font-medium text-center">{error}</p>}

            <Button type="submit" className="w-full text-base py-3" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
            </Button>
          </form>
        )}


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
