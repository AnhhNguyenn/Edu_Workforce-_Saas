using System;
using EduOps.Domain.Enums;

namespace EduOps.Application.DTOs.Billing
{
    public class PromotionRequestDto
    {
        public string? Code { get; set; }
        public PromotionType Type { get; set; }
        public decimal DiscountPercentage { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? MaxUses { get; set; }
    }
}
