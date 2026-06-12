import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export const useSystemOverview = () => {
  return useQuery({
    queryKey: ['analytics', 'system-overview'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/analytics/system-overview');
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache 5 minutes
  });
};

export const useSystemCharts = () => {
  return useQuery({
    queryKey: ['analytics', 'charts'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/analytics/charts');
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache 5 minutes
  });
};

export const useSystemErrorRates = (days: number = 30) => {
  return useQuery({
    queryKey: ['system-error-rates', days],
    queryFn: async () => {
      const response = await apiClient.get<any>('/analytics/error-rates', { params: { days } });
      return response.data;
    },
    staleTime: 5 * 60 * 1000
  });
};
