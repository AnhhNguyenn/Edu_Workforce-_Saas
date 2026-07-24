import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface TeacherReportRequestDto {
  lessonTaught?: string;
  progress?: string;
  teacherComment?: string;
  specialStudents?: string;
  ratingForAssistant?: number;
  feedbackForAssistant?: string;
}

export interface AssistantReportRequestDto {
  assistantNote?: string;
  ratingForTeacher?: number;
  feedbackForTeacher?: string;
}

export const useSessionReport = (sessionId: string) => {
  return useQuery({
    queryKey: ['report', sessionId],
    queryFn: async () => {
      try {
        const response = await apiClient.get<any>(`/reports/session/${sessionId}`);
        return response.data;
      } catch (e: any) {
        if (e.response && e.response.status === 404) {
          return null;
        }
        throw e;
      }
    }
  });
};

export const useSubmitTeacherReport = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TeacherReportRequestDto) => {
      const response = await apiClient.post(`/reports/session/${sessionId}/teacher`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
};

export const useSubmitAssistantReport = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AssistantReportRequestDto) => {
      const response = await apiClient.post(`/reports/session/${sessionId}/assistant`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
};

export const useUploadReportMedia = () => {
  return useMutation({
    mutationFn: async ({ reportId, file }: { reportId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post(`/reports/${reportId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }
  });
};

export interface ReportDto {
  id: string;
  sessionId: string;
  attendanceCount?: number;
  absentCount?: number;
  status: string;
  statusCode?: string;
  submittedAt?: string;
  teacherName?: string;
  className?: string;
  lessonTaught?: string;
  progress?: string;
  teacherComment?: string;
  assistantNote?: string;
  specialStudents?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const useReports = (pageNumber = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['reports', pageNumber, pageSize],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<ReportDto>>(`/reports?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      return response.data;
    },
    refetchInterval: 5000
  });
};
