using System;

namespace EduOps.Application.DTOs.Subscription
{
    public class PromotionDto
    {
        public Guid Id { get; set; }
        public string? Code { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? MaxUses { get; set; }
        public int CurrentUses { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
