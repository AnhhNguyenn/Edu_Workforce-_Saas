using System;

namespace EduOps.Domain.Entities
{
    public abstract class BaseEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }

    public abstract class TenantEntity : BaseEntity
    {
        /// <summary>
        /// Null for Super Admins
        /// </summary>
        public Guid? OrganizationId { get; set; }
    }
}
