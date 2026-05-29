using System;
using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class Promotion : BaseEntity
    {
        // Có thể null nếu là AUTO_DISCOUNT
        public string? Code { get; set; }
        
        public PromotionType Type { get; set; } = PromotionType.PROMO_CODE;
        
        public decimal DiscountPercentage { get; set; } // 0 đến 100
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        // Bằng null tức là không giới hạn số lượng (chỉ chặn theo thời gian)
        public int? MaxUses { get; set; }
        public int CurrentUses { get; set; }
        
        public AccountStatus Status { get; set; } = AccountStatus.ACTIVE;
    }
}
