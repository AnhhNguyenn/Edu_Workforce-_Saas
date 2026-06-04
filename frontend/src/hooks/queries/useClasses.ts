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

export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<ClassDto>>('/classes');
      return response.data; // Trả về toàn bộ PagedResult
    }
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; teacherId?: string; maxStudents?: number }) => {
      const response = await apiClient.post('/classes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    }
  });
};
