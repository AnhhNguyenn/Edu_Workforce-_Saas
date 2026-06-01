using System;
using System.ComponentModel.DataAnnotations;
using EduOps.Domain.Enums;

namespace EduOps.Application.DTOs.Billing.Requests
{
    public class CreatePromotionRequestDto
    {
        public string? Code { get; set; }
        
        [Required]
        public PromotionType Type { get; set; }
        
        [Required]
        public decimal DiscountPercentage { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public int? MaxUses { get; set; }
    }
}
