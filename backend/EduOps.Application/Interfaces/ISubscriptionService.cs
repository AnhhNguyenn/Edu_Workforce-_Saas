using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Billing;

namespace EduOps.Application.Interfaces
{
    public interface ISubscriptionService
    {
        // Plans (Super Admin)
        Task<List<SubscriptionPlanDto>> GetPlansAsync();
        Task<SubscriptionPlanDto> CreatePlanAsync(SubscriptionPlanRequestDto request);
        
        // Promotions (Super Admin)
        Task<List<PromotionDto>> GetPromotionsAsync();
        Task<PromotionDto> CreatePromotionAsync(PromotionRequestDto request);
        
        // Subscribe (Center Admin)
        Task<string> SubscribeAsync(Guid orgId, SubscribeRequestDto request);
    }
}
