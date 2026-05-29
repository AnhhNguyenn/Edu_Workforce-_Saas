using System;
using EduOps.Domain.Enums;

namespace EduOps.Application.DTOs.Billing
{
    public class SubscriptionPlanDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int MaxUsers { get; set; }
        public decimal PricePerMonth { get; set; }
        public decimal PricePerYear { get; set; }
        public AccountStatus Status { get; set; }
    }
}
