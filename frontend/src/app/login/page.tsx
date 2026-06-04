'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, BookOpen } from 'lucide-react';
import axios from 'axios';
import { ENV } from '@/config/env';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get('error');

  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
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
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Đã xảy ra lỗi hệ thống!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const verifyRes = await axios.post(`${ENV.API_URL}/auth/verify-2fa`, {
        tempToken,
        otpCode: otp
      });

      const data = verifyRes.data;
      
      // Save token to NextAuth
      const signInRes = await signIn('credentials', {
        accessToken: data.accessToken,
        userStr: JSON.stringify(data.user),
        redirect: false
      });

      if (signInRes?.ok) {
        router.push('/');
        router.refresh();
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
            {errorMsg === 'AccessDenied' 
              ? 'Bạn không có quyền truy cập trang này!' 
              : 'Sai email hoặc mật khẩu (hoặc tài khoản đã bị khóa)!'}
          </div>
        )}

        {requires2FA ? (
          <form onSubmit={handleVerify2FA} className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
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
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            
            {error && <p className="text-edu-danger text-sm font-medium text-center">{error}</p>}

            <Button type="submit" className="w-full text-base py-3" disabled={loading || otp.length !== 6}>
              {loading ? 'Đang xác minh...' : 'Xác minh'}
            </Button>
            <div className="text-center">
              <button type="button" onClick={() => setRequires2FA(false)} className="text-xs text-edu-muted hover:text-edu-accent underline">Quay lại đăng nhập</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Email</label>
              <Input 
                type="email" 
                placeholder="Nhập địa chỉ email..." 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
