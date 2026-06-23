import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface SystemBroadcastDto {
  id: string;
  title: string;
  message: string;
  type: string;
  actionLink?: string;
  targetRoles?: string;
  targetPercentage: number;
  isSent: boolean;
  sentAt?: string;
  isRecalled: boolean;
  recalledAt?: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const useBroadcasts = (pageNumber = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['broadcasts', pageNumber, pageSize],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<SystemBroadcastDto>>('/superadmin/broadcasts', {
        params: { pageNumber, pageSize }
      });
      return response.data;
    }
  });
};

export const useCreateBroadcast = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/superadmin/broadcasts', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    }
  });
};

export const useUpdateBroadcast = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiClient.put(`/superadmin/broadcasts/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    }
  });
};

export const useDeleteBroadcast = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/superadmin/broadcasts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    }
  });
};

export const useSendBroadcast = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/superadmin/broadcasts/${id}/send`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    }
  });
};

export const useRecallBroadcast = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/superadmin/broadcasts/${id}/recall`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    }
  });
};
