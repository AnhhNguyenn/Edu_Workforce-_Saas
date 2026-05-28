using System;

namespace EduOps.Domain.Entities
{
    public class Notification : TenantEntity
    {
        public Guid UserId { get; set; }
        
        // CLASS_REMINDER, LATE_ALERT, MISSING_REPORT, SESSION_CHANGED, CHECKOUT_ALERT
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }
    }
}
