using System;


namespace EduOps.Application.DTOs.Billing.Responses
{
    public class PromotionResponseDto
    {
        public Guid Id { get; set; }
        public string? Code { get; set; }
        public string? Type { get; set; }
        public decimal DiscountPercentage { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? MaxUses { get; set; }
        public int CurrentUses { get; set; }
        public string? Status { get; set; }
    }
}
