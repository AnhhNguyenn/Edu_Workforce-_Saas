using System;

namespace EduOps.Application.DTOs.Subscription
{
    public class PromotionRequestDto
    {
        public string? Code { get; set; }
        public string Type { get; set; } = "PROMO_CODE";
        public decimal DiscountPercentage { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? MaxUses { get; set; }
    }
}
