'use client';

import { useState, Suspense, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, BookOpen } from 'lucide-react';
import axios from 'axios';
import { ENV } from '@/config/env';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
});

const otpSchema = z.object({
  otp: z.string().length(6, 'Mã OTP phải có 6 chữ số')
});

type LoginFormValues = z.infer<typeof loginSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

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
  }, []);

  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const { register: registerOtp, handleSubmit: handleSubmitOtp, formState: { errors: otpErrors }, watch } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema)
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg border border-edu-border">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-edu-accent to-[#7BC4FF] rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-sm">
            <BookOpen size={28} />
          </div>
          <h1 className="text-2xl font-bold text-edu-fg">Đăng nhập EduOps</h1>
          <p className="text-edu-muted text-sm mt-2">Hệ thống quản lý trung tâm & giáo viên</p>
        </div>

        {errorMsg && (
          <div className="bg-edu-dangerLight text-edu-danger p-3 rounded-lg text-sm mb-4 text-center font-medium">
            {errorMsg === 'access-denied' 
              ? 'Bạn không có quyền truy cập trang này!' 
              : 'Sai email hoặc mật khẩu (hoặc tài khoản đã bị khóa)!'}
          </div>
        )}

        {requires2FA ? (
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
                <a href="#" className="text-xs text-edu-accent font-medium hover:underline">Quên mật khẩu?</a>
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
