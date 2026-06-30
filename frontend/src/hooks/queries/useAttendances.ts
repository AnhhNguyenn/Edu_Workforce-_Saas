import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface AttendanceRequestDto {
  latitude?: number;
  longitude?: number;
  note?: string;
}

export interface StudentAttendanceSubmitDto {
  records: {
    studentId: string;
    isPresent: boolean;
    note?: string;
  }[];
}

export const useMyAttendances = () => {
  return useQuery({
    queryKey: ['my-attendances'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/attendances/me');
      return response.data;
    }
  });
};

export const useAttendanceStats = (days: number = 7) => {
  return useQuery({
    queryKey: ['attendance-stats', days],
    queryFn: async () => {
      const response = await apiClient.get<any[]>(`/attendances/stats?days=${days}`);
      return response.data;
    }
  });
};

export const useTodayAttendances = () => {
  return useQuery({
    queryKey: ['today-attendances'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/attendances/today');
      return response.data;
    }
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AttendanceRequestDto) => {
      const response = await apiClient.post('/attendances/check-in', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-attendances'] });
    }
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AttendanceRequestDto) => {
      const response = await apiClient.post('/attendances/check-out', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-attendances'] });
    }
  });
};

export const useSubmitStudentAttendances = (sessionId: string) => {
  return useMutation({
    mutationFn: async (data: StudentAttendanceSubmitDto) => {
      const response = await apiClient.post(`/attendances/sessions/${sessionId}/students`, data);
      return response.data;
    }
  });
};
