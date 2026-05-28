using System;

namespace EduOps.Domain.Entities
{
    public class BillingTransaction : TenantEntity
    {
        public decimal Amount { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        
        // SUCCESS, FAILED, PENDING
        public string Status { get; set; } = "PENDING";
        
        public string? PaymentMethod { get; set; }
        public string? ReferenceCode { get; set; }
    }
}
