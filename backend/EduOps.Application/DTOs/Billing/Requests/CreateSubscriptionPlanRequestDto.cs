using System;
using System.ComponentModel.DataAnnotations;

namespace EduOps.Application.DTOs.Billing.Requests
{
    public class CreateSubscriptionPlanRequestDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public int MaxUsers { get; set; }
        
        [Required]
        public decimal PricePerMonth { get; set; }
        
        [Required]
        public decimal PricePerYear { get; set; }
    }
}
