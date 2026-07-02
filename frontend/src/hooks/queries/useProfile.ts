import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  role: string;
  organizationName?: string;
  schoolName?: string;
  stats?: {
    totalSessions: number;
    attendanceRate: number;
  };
  customAppName?: string;
  customLogoUrl?: string;
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

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: { oldPassword?: string; newPassword?: string }) => {
      const response = await apiClient.post('/profile/password', data);
      return response.data;
    }
  });
};

export const useUploadOrganizationLogo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/profile/organization/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
};

export interface TeacherSessionStatDto {
  sessionId: string;
  className: string;
  lessonTitle: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  sessionStatus: string;
  hasCheckedIn: boolean;
  checkinTime?: string;
  lateMinutes: number;
  penaltyPercentage: number;
  attendanceStatus: 'OK' | 'LATE' | 'MISSED' | 'UPCOMING';
}

export interface TeacherStatsDto {
  totalSessions: number;
  completedSessions: number;
  attendanceRate: number;
  sessions: TeacherSessionStatDto[];
}

export const useProfileStats = (month?: number, year?: number) => {
  return useQuery({
    queryKey: ['profile', 'stats', month, year],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      
      const response = await apiClient.get<TeacherStatsDto>(`/profile/stats?${params.toString()}`);
      return response.data;
    }
  });
};
