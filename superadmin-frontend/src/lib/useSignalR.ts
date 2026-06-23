'use client';

import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/store/useAppStore';
import { ENV } from '@/config/env';
import { useQueryClient } from '@tanstack/react-query';

export function useSignalR() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const addNotification = useAppStore(state => state.addNotification);
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
        newConnection.on('AdminTransactionUpdated', () => {
          queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
        });
        newConnection.on('AdminOrganizationUpdated', () => {
          queryClient.invalidateQueries({ queryKey: ['organizations'] });
        });
        newConnection.on('AdminUserUpdated', () => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
        });
        newConnection.on('SystemSettingUpdated', () => {
          queryClient.invalidateQueries({ queryKey: ['settings'] });
        });
        newConnection.on('AuditLogUpdated', () => {
          queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
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
