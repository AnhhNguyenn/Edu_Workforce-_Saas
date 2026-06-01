using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Billing.Requests;
using EduOps.Application.DTOs.Billing.Responses;

namespace EduOps.Application.Interfaces
{
    public interface ISubscriptionService
    {
        // Plans (Super Admin)
        Task<List<SubscriptionPlanResponseDto>> GetPlansAsync();
        Task<SubscriptionPlanResponseDto> CreatePlanAsync(CreateSubscriptionPlanRequestDto request);
        
        // Promotions (Super Admin)
        Task<List<PromotionResponseDto>> GetPromotionsAsync();
        Task<PromotionResponseDto> CreatePromotionAsync(CreatePromotionRequestDto request);
        
        Task<SubscribeResponseDto> SubscribeAsync(SubscribeRequestDto request);
        Task<MySubscriptionDto> GetMySubscriptionAsync();
        Task<IEnumerable<BillingTransactionDto>> GetMyTransactionsAsync();
        Task<string> GetTransactionStatusAsync(string referenceCode);
    }
}
