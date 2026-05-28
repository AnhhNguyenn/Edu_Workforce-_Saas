'use client';

import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/store/useAppStore';
import { ENV } from '@/config/env';

export function useSignalR() {
  const { data: session } = useSession();
  const addNotification = useAppStore(state => state.addNotification);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    // Chỉ kết nối khi đã có session và token
    const token = (session as any)?.accessToken;
    if (!token) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(ENV.HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [session]);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('Connected to SignalR Hub!');

          // Lắng nghe các event từ Backend
          connection.on('ReceiveNotification', (title: string, message: string, type: 'info' | 'success' | 'warn' | 'danger') => {
            addNotification({
              title,
              message,
              type,
            });
          });
        })
        .catch(e => console.error('SignalR Connection Error: ', e));

      return () => {
        connection.stop();
      };
    }
  }, [connection, addNotification]);

  return connection;
}
