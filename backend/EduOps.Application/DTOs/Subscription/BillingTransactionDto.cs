using System;

namespace EduOps.Application.DTOs.Subscription
{
    public class BillingTransactionDto
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public string? PlanName { get; set; }
        public int MonthsToAdd { get; set; }
        public DateTime PaymentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ReferenceCode { get; set; }
    }
}
