using System;

namespace EduOps.Application.DTOs.Billing.Requests
{
    public class UpdateSubscriptionPlanRequestDto
    {
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int MaxUsers { get; set; }

        public decimal PricePerMonth { get; set; }
        
        public decimal PricePerYear { get; set; }
    }
}
