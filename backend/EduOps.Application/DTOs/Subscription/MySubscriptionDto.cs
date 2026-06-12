using System;

namespace EduOps.Application.DTOs.Subscription
{
    public class MySubscriptionDto
    {
        public Guid? PlanId { get; set; }
        public string? PlanName { get; set; }
        public DateTime? SubscriptionStart { get; set; }
        public DateTime? SubscriptionEnd { get; set; }
        public string SubscriptionStatus { get; set; } = string.Empty;
        public int MaxUsers { get; set; }
        public int CurrentUsers { get; set; }
    }
}
