import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface SchoolDto {
  id: string;
  name: string;
  address: string;
  gpsRadius: number;
  latitude?: number;
  longitude?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const useSchools = (pageNumber = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['schools', pageNumber, pageSize],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<SchoolDto>>('/schools', {
        params: { pageNumber, pageSize }
      });
      return response.data;
    }
  });
};

export interface CreateSchoolDto {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  attendanceRadius?: number;
}

export const useCreateSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSchoolDto) => {
      const response = await apiClient.post<SchoolDto>('/schools', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    }
  });
};
