'use client';

import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/store/useAppStore';
import { ENV } from '@/config/env';
import { useQueryClient } from '@tanstack/react-query';

export function useSignalR() {
  const { data: session } = useSession();
  const addNotification = useAppStore(state => state.addNotification);
  const queryClient = useQueryClient();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const token = (session as any)?.accessToken;

  useEffect(() => {
    if (!token) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(ENV.HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => {
        console.log('Connected to SignalR Hub!');
        newConnection.on('ReceiveNotification', (title: string, message: string, type: 'info' | 'success' | 'warn' | 'danger') => {
          addNotification({ title, message, type });
        });

        // Lắng nghe sự kiện InvalidatePlans từ Backend để realtime cập nhật Gói cước / Khuyến mãi
        newConnection.on('InvalidatePlans', () => {
          queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
        });
      })
      .catch(e => {
        // Bỏ qua lỗi do React 18 Strict Mode tự động unmount component khi đang connect
        if (e.message && e.message.includes('stopped during negotiation')) {
          return;
        }
        console.error('SignalR Connection Error: ', e);
      });

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, [token, addNotification, queryClient]);

  return connection;
}
