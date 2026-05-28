import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  organizationName?: string;
  status: string;
  lastLoginAt?: string;
  lockEndAt?: string;
}

export const useUsers = (roleFilter?: string) => {
  return useQuery({
    queryKey: ['users', roleFilter],
    queryFn: async () => {
      const response = await apiClient.get<UserDto[]>('/users', {
        params: { role: roleFilter }
      });
      return response.data;
    }
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const useLockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, lockEndAt }: { id: string, lockEndAt: string | null }) => {
      await apiClient.post(`/users/${id}/lock`, { lockEndAt });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const useUnlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/users/${id}/unlock`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};
