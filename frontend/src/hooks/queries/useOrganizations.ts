import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface OrganizationDto {
  id: string;
  name: string;
  code: string;
  plan: string;
  status: string;
  teachersCount?: number;
  studentsCount?: number;
  createdAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  code: string;
  email: string;
  phone?: string;
  address?: string;
  maxUsers?: number;
}

export const useOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await apiClient.get<OrganizationDto[]>('/organizations');
      return response.data;
    }
  });
};

export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: async () => {
      const response = await apiClient.get<OrganizationDto>(`/organizations/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateOrganizationDto) => {
      const response = await apiClient.post<OrganizationDto>('/organizations', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate cache to trigger a re-fetch
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    }
  });
};

export const useToggleOrgStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action }: { id: string, action: 'activate' | 'suspend' }) => {
      await apiClient.post(`/organizations/${id}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    }
  });
};
