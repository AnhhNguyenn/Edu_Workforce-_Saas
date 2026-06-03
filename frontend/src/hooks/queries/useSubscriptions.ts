import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export const useMyTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await apiClient.get('/subscriptions/my-transactions');
      // Tùy theo cấu trúc API trả về là array hay object có items
      return response.data.items || response.data || [];
    }
  });
};
