using System;

namespace EduOps.Domain.Entities
{
    public class OrganizationDetail : BaseEntity
    {
        public Guid OrganizationId { get; set; }
        public virtual Organization? Organization { get; set; }

        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }
}
