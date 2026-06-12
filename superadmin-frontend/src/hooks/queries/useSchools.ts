import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface SchoolDto {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  gpsRadius?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const useSchools = (searchKeyword?: string) => {
  return useQuery({
    queryKey: ['schools', searchKeyword],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<SchoolDto>>('/schools', {
        params: { searchKeyword }
      });
      return response.data;
    }
  });
};

export const useCreateSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/schools', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    }
  });
};

export const useUpdateSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/schools/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    }
  });
};

export const useDeleteSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/schools/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    }
  });
};
