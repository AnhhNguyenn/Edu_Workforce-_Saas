using System;

using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class Organization : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Address { get; set; }
        
        public int MaxUsers { get; set; }
        public int CurrentUsers { get; set; }
        
        public AccountStatus Status { get; set; } = AccountStatus.ACTIVE;
        
        // Trạng thái Gói cước: TRIAL, ACTIVE, EXPIRED, LOCKED
        public string SubscriptionStatus { get; set; } = "LOCKED";
        
        public DateTime? SubscriptionStart { get; set; }
        public DateTime? SubscriptionEnd { get; set; }
    }
}
