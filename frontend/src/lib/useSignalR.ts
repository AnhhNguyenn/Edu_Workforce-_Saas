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
        newConnection.on('OrgTeachersUpdated', () => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
        });
        newConnection.on('AttendanceUpdated', () => {
          queryClient.invalidateQueries({ queryKey: ['attendances'] });
          queryClient.invalidateQueries({ queryKey: ['sessions'] });
        });
        
        // Realtime cho hệ thống CenterAdmin / Teacher
        newConnection.on('ClassUpdated', () => {
          queryClient.invalidateQueries({ queryKey: ['classes'] });
          queryClient.invalidateQueries({ queryKey: ['sessions'] });
        });
        newConnection.on('StudentUpdated', () => {
          queryClient.invalidateQueries({ queryKey: ['students'] });
          queryClient.invalidateQueries({ queryKey: ['classes'] }); // Do enrollment thay đổi
        });
        newConnection.on('SessionUpdated', () => {
          queryClient.invalidateQueries({ queryKey: ['sessions'] });
          queryClient.invalidateQueries({ queryKey: ['schedules'] }); 
        });
        newConnection.on('ScheduleUpdated', () => {
          queryClient.invalidateQueries({ queryKey: ['schedules'] });
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
