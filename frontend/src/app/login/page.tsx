'use client';

import { useState, Suspense } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get('error');

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
        redirect: true,
        callbackUrl: '/'
      });
      // Nếu redirect: true, code bên dưới sẽ không chạy nếu thành công (vì trang đã chuyển)
      // Nếu thất bại, nó sẽ redirect về /login?error=CredentialsSignin, ta có thể bắt qua useSearchParams

    } catch (err) {
      setError('Đã xảy ra lỗi hệ thống!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg border border-edu-border">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-edu-accent to-[#7BC4FF] rounded-2xl mx-auto flex items-center justify-center text-white text-3xl mb-4 shadow-sm">
            📘
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

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Email</label>
            <Input 
              type="email" 
              placeholder="admin@eduops.vn" 
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
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-edu-danger text-sm font-medium">{error}</p>}

          <Button type="submit" className="w-full text-base py-3" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-edu-border text-center">
          <p className="text-xs text-edu-muted">
            Tài khoản test: <br/>
            <code className="text-edu-accent font-semibold">admin@eduops.vn / 123456</code><br/>
            <code className="text-edu-accent font-semibold">center@eduops.vn / 123456</code>
          </p>
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
