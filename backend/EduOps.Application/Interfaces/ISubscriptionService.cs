using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Billing.Requests;
using EduOps.Application.DTOs.Billing.Responses;
using EduOps.Application.DTOs.Subscription;

namespace EduOps.Application.Interfaces
{
    public interface ISubscriptionService
    {
        // Plans (Super Admin)
        Task<List<SubscriptionPlanResponseDto>> GetPlansAsync();
        Task<SubscriptionPlanResponseDto> CreatePlanAsync(CreateSubscriptionPlanRequestDto request);
        Task UpdatePlanAsync(Guid id, UpdateSubscriptionPlanRequestDto request);
        Task DeletePlanAsync(Guid id);

        // Promotions (Super Admin)
        Task<List<PromotionResponseDto>> GetPromotionsAsync();
        Task<PromotionResponseDto> CreatePromotionAsync(CreatePromotionRequestDto request);
        Task UpdatePromotionAsync(Guid id, UpdatePromotionRequestDto request);
        Task DeletePromotionAsync(Guid id);
        Task<List<PromotionUsageResponseDto>> GetPromotionUsageHistoryAsync(Guid promotionId);

        Task<SubscribeResponseDto> SubscribeAsync(SubscribeRequestDto request);
        Task<PreviewSubscribeResponseDto> PreviewSubscribeAsync(SubscribeRequestDto request);
        Task<MySubscriptionDto> GetMySubscriptionAsync();
        Task<IEnumerable<BillingTransactionDto>> GetMyTransactionsAsync();
        Task<IEnumerable<BillingTransactionDto>> GetAllTransactionsAsync();
        Task<string> GetTransactionStatusAsync(string referenceCode);
    }
}
