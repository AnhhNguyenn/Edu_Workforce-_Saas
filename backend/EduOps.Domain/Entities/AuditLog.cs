using System;

namespace EduOps.Domain.Entities
{
    public class AuditLog : TenantEntity
    {
        public Guid UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public Guid EntityId { get; set; }
        
        public string? OldData { get; set; } // JSON string
        public string? NewData { get; set; } // JSON string
        
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}
