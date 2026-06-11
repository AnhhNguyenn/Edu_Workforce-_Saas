import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  organizationName?: string;
  schoolName?: string;
  stats?: {
    totalSessions: number;
    attendanceRate: number;
  };
}

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/profile');
      const data = response.data;
      return {
        ...data,
        role: data.roleCode || data.role,
        status: data.statusCode || data.status
      } as UserProfileDto;
    }
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<UserProfileDto>) => {
      const response = await apiClient.put('/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
};
