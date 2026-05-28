import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface ClassDto {
  id: string;
  name: string;
  teacherName: string;
  schedule: string;
  studentsCount: number;
  status: string;
}

export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await apiClient.get<ClassDto[]>('/classes');
      return response.data;
    }
  });
};
