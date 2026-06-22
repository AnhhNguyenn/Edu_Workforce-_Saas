import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface SessionListResponseDto {
  id: string;
  classId: string;
  className?: string;
  lessonTitle?: string;
  roomName?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status?: string;
  statusCode?: string;
  teacherId?: string;
  teacherName?: string;
  assistantIds?: string[];
  notes?: string;
  localTeachingAssistant?: string;
  lessonProgress?: string;
  actualStudentCount?: number;
  extraData?: string;
}

export interface TenantCustomFieldDto {
  id: string;
  entityName: string;
  fieldName: string;
  fieldType: string;
  isRequired: boolean;
  orderIndex: number;
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

export const useCustomFields = () => {
  return useQuery({
    queryKey: ['sessionCustomFields'],
    queryFn: async () => {
      const response = await apiClient.get<TenantCustomFieldDto[]>('/sessions/custom-fields');
      return response.data;
    }
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { classId: string; teacherId?: string | null; assistantIds?: string[]; lessonTitle?: string | null; roomName?: string | null; notes?: string | null; sessionDate: string; startTime: string; endTime: string; actualStudentCount?: number | null; localTeachingAssistant?: string | null; lessonProgress?: string | null; extraData?: string | null; }) => {
      const response = await apiClient.post('/sessions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });
};

export const useBatchCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { classIds: string[]; teacherId?: string | null; assistantIds?: string[]; lessonTitle?: string | null; roomName?: string | null; notes?: string | null; sessionDate: string; startTime: string; endTime: string; actualStudentCount?: number | null; localTeachingAssistant?: string | null; lessonProgress?: string | null; extraData?: string | null; isRecurring?: boolean; recurringDaysOfWeek?: number[]; recurringEndDate?: string | null; }) => {
      const response = await apiClient.post('/sessions/batch', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });
};

export const useBatchUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { sessionIds: string[]; teacherId?: string | null; assistantId?: string | null; }) => {
      const response = await apiClient.post('/sessions/batch-update-staff', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });
};

export const useImportSessions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post('/sessions/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });
};

export const usePreviewImportSession = () => {
  return useMutation({
    mutationFn: async (data: { files: File[]; autoCreateSchools?: boolean; autoCreateClasses?: boolean; autoCreateUsers?: boolean; autoCreateCustomFields?: boolean }) => {
      const formData = new FormData();
      data.files.forEach(f => formData.append('Files', f));
      if (data.autoCreateSchools) formData.append('AutoCreateSchools', 'true');
      if (data.autoCreateClasses) formData.append('AutoCreateClasses', 'true');
      if (data.autoCreateUsers) formData.append('AutoCreateUsers', 'true');
      if (data.autoCreateCustomFields) formData.append('AutoCreateCustomFields', 'true');

      const response = await apiClient.post('/sessions/import/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
  });
};

export const useConfirmImportSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/sessions/import/confirm', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
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

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/sessions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/sessions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });
};
