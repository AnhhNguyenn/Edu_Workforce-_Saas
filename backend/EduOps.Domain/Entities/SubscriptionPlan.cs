using System;
using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class SubscriptionPlan : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        
        // Số lượng tối đa GV/TA được tạo trong gói
        public int MaxUsers { get; set; }
        
        public decimal PricePerMonth { get; set; }
        public decimal PricePerYear { get; set; }
        
        public AccountStatus Status { get; set; } = AccountStatus.ACTIVE;
    }
}
