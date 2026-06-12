using System;

namespace EduOps.Application.DTOs.Subscription
{
    public class PreviewSubscribeResponseDto
    {
        public decimal OriginalPrice { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalPrice { get; set; }
        public string? AppliedPromotionCode { get; set; }
        public string PlanName { get; set; } = string.Empty;
    }
}
