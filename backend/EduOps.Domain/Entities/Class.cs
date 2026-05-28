using System;

namespace EduOps.Domain.Entities
{
    public class Class : TenantEntity
    {
        public Guid SchoolId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Grade { get; set; }
        public string? Subject { get; set; }
        public string? Description { get; set; }
        
        // ACTIVE, INACTIVE, COMPLETED
        public string Status { get; set; } = "ACTIVE";
    }
}
