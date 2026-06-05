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

export interface UpdateOrgSubscriptionDto {
  planId: string | null;
  subscriptionStatus: string;
  subscriptionEnd: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const useOrganizations = (searchKeyword?: string, pageNumber: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: ['organizations', searchKeyword, pageNumber, pageSize],
    queryFn: async () => {
      const response = await apiClient.get<PagedResult<OrganizationDto>>('/organizations', {
        params: { searchKeyword: searchKeyword || undefined, pageNumber, pageSize }
      });
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
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    }
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put<OrganizationDto>(`/organizations/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    }
  });
};

export const useUpdateOrgSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrgSubscriptionDto }) => {
      await apiClient.put(`/organizations/${id}/subscription`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    }
  });
};

export const useOrganizationStats = (id?: string) => {
  return useQuery({
    queryKey: ['organizations', 'stats', id],
    queryFn: async () => {
      const response = await apiClient.get(`/organizations/${id}/stats`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/organizations/${id}`);
    },
    onSuccess: () => {
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
