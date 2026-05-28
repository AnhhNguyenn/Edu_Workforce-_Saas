using System;

namespace EduOps.Domain.Entities
{
    public class Attendance : TenantEntity
    {
        public Guid SessionId { get; set; }
        public Guid UserId { get; set; }
        
        public DateTime? CheckinTime { get; set; }
        public DateTime? CheckoutTime { get; set; }
        
        public decimal? CheckinLatitude { get; set; }
        public decimal? CheckinLongitude { get; set; }
        public decimal? CheckoutLatitude { get; set; }
        public decimal? CheckoutLongitude { get; set; }
        
        // BỔ SUNG: Chống Fake GPS, lưu ảnh selfie qua R2 Cloudflare
        public string? CheckinImageUrl { get; set; }
        
        public int LateMinutes { get; set; }
        public int EarlyCheckoutMinutes { get; set; }
        
        // ON_TIME, LATE, ABSENT, EARLY_CHECKOUT
        public string Status { get; set; } = "ABSENT";
        
        public string? Note { get; set; }
    }
}
