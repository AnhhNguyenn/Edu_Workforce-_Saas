'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Có thể log error ra hệ thống theo dõi (Sentry, v.v.)
    console.error("Super Admin Module Error:", error);
  }, [error]);

  return (
    <div className="w-full h-full min-h-[50vh] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-edu-dangerLight p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-12 h-12 bg-edu-dangerLight text-edu-danger rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-bold text-edu-fg mb-2">Lỗi tải phân hệ!</h2>
        <p className="text-sm text-edu-muted mb-6">
          Đã xảy ra lỗi khi tải chức năng này. Các phần khác của hệ thống vẫn hoạt động bình thường.
        </p>
        <Button onClick={() => reset()} variant="primary" className="w-full">
          Thử lại ngay
        </Button>
      </div>
    </div>
  );
}
