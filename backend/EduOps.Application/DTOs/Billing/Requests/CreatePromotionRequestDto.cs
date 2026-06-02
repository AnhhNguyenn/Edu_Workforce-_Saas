using System;


namespace EduOps.Application.DTOs.Billing.Requests
{
    public class CreatePromotionRequestDto
    {
        public string? Code { get; set; }

        public string? Type { get; set; }

        public decimal DiscountPercentage { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int? MaxUses { get; set; }
    }
}
