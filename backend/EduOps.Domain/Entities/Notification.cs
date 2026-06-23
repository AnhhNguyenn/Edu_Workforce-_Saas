using System;

namespace EduOps.Domain.Entities
{
    public class Notification : TenantEntity
    {
        public Guid UserId { get; set; }

        // CLASS_REMINDER, LATE_ALERT, MISSING_REPORT, SESSION_CHANGED, CHECKOUT_ALERT
        public Guid? TypeId { get; set; }
        public virtual NotificationType? Type { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }

        public string? ActionLink { get; set; }

        public Guid? SystemBroadcastId { get; set; }
        public virtual SystemBroadcast? SystemBroadcast { get; set; }
    }
}
