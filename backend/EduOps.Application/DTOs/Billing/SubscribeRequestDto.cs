using System;

namespace EduOps.Application.DTOs.Billing
{
    public class SubscribeRequestDto
    {
        public Guid PlanId { get; set; }
        public string BillingCycle { get; set; } = "MONTHLY"; // MONTHLY, YEARLY
        public string? PromoCode { get; set; }
    }
}
