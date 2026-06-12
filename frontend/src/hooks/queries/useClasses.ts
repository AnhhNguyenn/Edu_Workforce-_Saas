import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface ClassDto {
  id: string;
  name: string;
  teacherName: string;
  schedule: string;
  studentsCount: number;
  maxStudents?: number;
  status: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const useClasses = (searchKeyword?: string, schoolId?: string) => {
  return useQuery({
    queryKey: ['classes', searchKeyword, schoolId],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<ClassDto>>('/classes', {
        params: { 
          searchKeyword: searchKeyword || undefined,
          schoolId: schoolId || undefined
        }
      });
      return response.data; // Trả về toàn bộ PagedResult
    }
  });
};

export const useClassDetails = (id: string | null) => {
  return useQuery({
    queryKey: ['class', id],
    queryFn: async () => {
      const response = await apiClient.get<ClassDto>(`/classes/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useClassStudents = (id: string | null) => {
  return useQuery({
    queryKey: ['class-students', id],
    queryFn: async () => {
      const response = await apiClient.get<any[]>(`/classes/${id}/students`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; schoolId: string; description?: string }) => {
      const response = await apiClient.post('/classes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    }
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/classes/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    }
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/classes/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    }
  });
};
