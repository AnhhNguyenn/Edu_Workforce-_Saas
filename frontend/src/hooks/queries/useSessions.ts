import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface SessionListResponseDto {
  id: string;
  classId: string;
  className?: string;
  lessonTitle?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status?: string;
  statusCode?: string;
  roomName?: string;
  teacherId?: string;
  teacherName?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const useSessions = (date?: string) => {
  return useQuery({
    queryKey: ['sessions', date],
    queryFn: async () => {
      // In a real app we would pass Date range to backend if supported.
      // If not supported by DTO, we fetch all and filter in frontend, or backend will handle it.
      const response = await apiClient.get<PagedResult<SessionListResponseDto>>('/sessions');
      return response.data;
    }
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { classId: string; teacherId: string; lessonTitle: string; sessionDate: string; startTime: string; endTime: string; }) => {
      const response = await apiClient.post('/sessions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });
};

export const useSubmitAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: string; data: any }) => {
      const response = await apiClient.post(`/attendances/sessions/${sessionId}/students`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });
};
