using System;

namespace EduOps.Application.DTOs.Subscription
{
    public class SubscriptionPlanDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int MaxUsers { get; set; }
        public decimal PricePerMonth { get; set; }
        public decimal PricePerYear { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
