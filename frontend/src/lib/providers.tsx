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
          <Toaster 
            position="top-right" 
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: '#FFFFFF',
                color: '#1E293B',
                fontSize: '14px',
                fontWeight: '600',
                padding: '12px 16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
                border: '1px solid #E2E8F0',
                maxWidth: '400px',
              },
              success: {
                style: {
                  background: '#F0FDF4',
                  color: '#15803D',
                  borderColor: '#DCFCE7',
                },
                iconTheme: {
                  primary: '#15803D',
                  secondary: '#F0FDF4',
                },
              },
              error: {
                style: {
                  background: '#FFF5F5',
                  color: '#E53E3E',
                  borderColor: '#FED7D7',
                },
                iconTheme: {
                  primary: '#E53E3E',
                  secondary: '#FFF5F5',
                },
              },
            }}
          />
        </ConfirmProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
