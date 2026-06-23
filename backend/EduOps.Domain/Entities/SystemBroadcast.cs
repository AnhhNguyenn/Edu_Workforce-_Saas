using System;
using System.Collections.Generic;

namespace EduOps.Domain.Entities
{
    public class SystemBroadcast : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        
        // info, success, warn, danger
        public string Type { get; set; } = "info";
        
        public string? ActionLink { get; set; }

        // Role filters (e.g. "CENTER_ADMIN,TEACHER"). Null or empty means ALL roles
        public string? TargetRoles { get; set; }

        // 0 to 100 percentage of users in the target roles
        public int TargetPercentage { get; set; } = 100;

        public bool IsSent { get; set; }
        public DateTime? SentAt { get; set; }

        public bool IsRecalled { get; set; }
        public DateTime? RecalledAt { get; set; }

        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
