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

export const useClasses = (searchKeyword?: string) => {
  return useQuery({
    queryKey: ['classes', searchKeyword],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<ClassDto>>('/classes', {
        params: { searchKeyword: searchKeyword || undefined }
      });
      return response.data; // Trả về toàn bộ PagedResult
    }
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
