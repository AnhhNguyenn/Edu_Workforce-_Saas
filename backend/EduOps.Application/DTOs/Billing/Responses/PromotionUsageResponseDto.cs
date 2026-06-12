using System;

namespace EduOps.Application.DTOs.Billing.Responses
{
    public class PromotionUsageResponseDto
    {
        public Guid TransactionId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public string PlanName { get; set; } = string.Empty;
        public decimal AmountPaid { get; set; }
        public DateTime PaymentDate { get; set; }
        public string ReferenceCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
