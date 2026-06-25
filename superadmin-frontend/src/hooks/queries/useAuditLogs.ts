import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export const useAuditLogs = (pageNumber = 1, pageSize = 100) => {
  return useQuery({
    queryKey: ['audit-logs', pageNumber, pageSize],
    queryFn: async () => {
      const response = await apiClient.get(`/systemsettings/audit-logs?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      return response.data; // This now returns { items, totalCount, pageNumber, pageSize, totalPages }
    }
  });
};
