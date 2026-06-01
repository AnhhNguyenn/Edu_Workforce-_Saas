using System;
using System.ComponentModel.DataAnnotations;

namespace EduOps.Application.DTOs.Billing.Requests
{
    public class SubscribeRequestDto
    {
        [Required]
        public Guid PlanId { get; set; }
        
        [Required]
        public string BillingCycle { get; set; } = "MONTHLY"; // MONTHLY, YEARLY
        
        public string? PromoCode { get; set; }
    }
}
