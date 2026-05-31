using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Subscription;

namespace EduOps.Application.Interfaces
{
    public interface ISubscriptionService
    {
        Task<IEnumerable<SubscriptionPlanDto>> GetPlansAsync();
        Task<SubscriptionPlanDto> CreatePlanAsync(SubscriptionPlanRequestDto request);
        
        Task<IEnumerable<PromotionDto>> GetPromotionsAsync();
        Task<PromotionDto> CreatePromotionAsync(PromotionRequestDto request);
        
        Task<SubscribeResponseDto> SubscribeAsync(SubscribeRequestDto request);
        Task<MySubscriptionDto> GetMySubscriptionAsync();
        Task<IEnumerable<BillingTransactionDto>> GetMyTransactionsAsync();
        Task<string> GetTransactionStatusAsync(string referenceCode);
    }
}
