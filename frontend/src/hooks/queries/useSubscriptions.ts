import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { PagedResult } from './useOrganizations';

export interface SubscriptionPlanDto {
  id: string;
  name: string;
  description: string;
  maxUsers: number;
  pricePerMonth: number;
  pricePerYear: number;
  status: string;
  activeDiscountPercentage?: number;
}

export interface SubscribeResponseDto {
  referenceCode: string;
  amount: number;
  planName: string;
  bankAccount: string;
  bankName: string;
  qrCodeUrl: string;
}

export interface PreviewSubscribeResponseDto {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  appliedPromotionCode?: string;
  planName: string;
}

export interface PromotionDto {
  id: string;
  code: string;
  type: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  maxUses: number | null;
  currentUses: number;
  status: string;
}

export interface PromotionUsageDto {
  transactionId: string;
  organizationName: string;
  planName: string;
  amountPaid: number;
  paymentDate: string;
  referenceCode: string;
}

export interface MySubscriptionDto {
  planId?: string;
  planName: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  subscriptionStatus: string;
  maxUsers: number;
  currentUsers: number;
}

export const usePlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionPlanDto[]>('/subscriptions/plans');
      return response.data;
    }
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/subscriptions/plans', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    }
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/subscriptions/plans/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    }
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/subscriptions/plans/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    }
  });
};

export const usePromotions = () => {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const response = await apiClient.get<PromotionDto[]>('/subscriptions/promotions');
      return response.data;
    }
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/subscriptions/promotions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    }
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/subscriptions/promotions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    }
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/subscriptions/promotions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    }
  });
};

export const usePromotionHistory = (promotionId: string | null) => {
  return useQuery({
    queryKey: ['promotion-history', promotionId],
    queryFn: async () => {
      if (!promotionId) return [];
      const response = await apiClient.get<PromotionUsageDto[]>(`/subscriptions/promotions/${promotionId}/history`);
      return response.data;
    },
    enabled: !!promotionId
  });
};

export const useSubscribe = () => {
  return useMutation({
    mutationFn: async (data: { planId: string, billingCycle: string, promoCode?: string }) => {
      const response = await apiClient.post<SubscribeResponseDto>('/subscriptions/subscribe', data);
      return response.data;
    }
  });
};

export const usePreviewSubscribe = () => {
  return useMutation({
    mutationFn: async (data: { planId: string, billingCycle: string, promoCode?: string }) => {
      const response = await apiClient.post<PreviewSubscribeResponseDto>('/subscriptions/preview-subscribe', data);
      return response.data;
    }
  });
};

export const useTransactionStatus = (referenceCode: string | null) => {
  return useQuery({
    queryKey: ['transaction-status', referenceCode],
    queryFn: async () => {
      const response = await apiClient.get<{ referenceCode: string, status: string }>(`/subscriptions/transactions/${referenceCode}/status`);
      return response.data.status;
    },
    enabled: !!referenceCode,
    refetchInterval: (query) => (query.state.data === 'PAID' ? false : 3000), // Poll every 3 seconds until paid
  });
};

export const useAllTransactions = () => {
  return useQuery({
    queryKey: ['all-transactions'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/subscriptions/transactions');
      return response.data;
    }
  });
};

export const useMySubscription = () => {
  return useQuery({
    queryKey: ['my-subscription'],
    queryFn: async () => {
      const response = await apiClient.get<MySubscriptionDto>('/subscriptions/my-subscription');
      return response.data;
    }
  });
};
