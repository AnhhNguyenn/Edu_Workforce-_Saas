import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const response = await apiClient.get('/systemsettings/audit-logs');
      return response.data;
    }
  });
};
