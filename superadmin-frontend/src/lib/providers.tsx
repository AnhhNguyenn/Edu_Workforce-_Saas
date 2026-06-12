'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ConfirmProvider } from '@/providers/ConfirmProvider';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 phút
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ConfirmProvider>
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </ConfirmProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
