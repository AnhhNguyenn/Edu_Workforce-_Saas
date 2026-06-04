import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const useNotifications = (pageNumber = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['notifications', pageNumber, pageSize],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<NotificationDto>>('/notifications', {
        params: { pageNumber, pageSize }
      });
      return response.data;
    }
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};
