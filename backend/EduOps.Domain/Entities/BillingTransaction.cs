using System;
using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class BillingTransaction : TenantEntity
    {
        public decimal Amount { get; set; }
        public string? PlanName { get; set; }
        
        public Guid PlanId { get; set; }
        public int MonthsToAdd { get; set; }
        public DateTime PaymentDate { get; set; }
        
        // SUCCESS, FAILED, PENDING
        public BillingStatus Status { get; set; } = BillingStatus.PENDING;
        
        public string? PaymentMethod { get; set; }
        public string? ReferenceCode { get; set; }
        
        // ID Giao dịch trả về từ SePay để đối soát
        public string? SePayTransactionId { get; set; }
    }
}
