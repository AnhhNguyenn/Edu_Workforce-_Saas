using System;

namespace EduOps.Application.DTOs.Subscription
{
    public class SubscribeRequestDto
    {
        public Guid PlanId { get; set; }
        public string BillingCycle { get; set; } = "MONTHLY"; // MONTHLY or YEARLY
        public string? PromoCode { get; set; }
    }
}
