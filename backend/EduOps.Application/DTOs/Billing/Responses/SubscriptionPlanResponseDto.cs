using System;


namespace EduOps.Application.DTOs.Billing.Responses
{
    public class SubscriptionPlanResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int MaxUsers { get; set; }
        public decimal PricePerMonth { get; set; }
        public decimal PricePerYear { get; set; }
        public string? Status { get; set; }
    }
}
