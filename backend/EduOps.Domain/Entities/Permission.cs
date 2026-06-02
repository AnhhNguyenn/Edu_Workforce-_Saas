using System;
using System.Collections.Generic;

namespace EduOps.Domain.Entities
{
    public class Permission : BaseEntity
    {
        public string Module { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string? Description { get; set; }

        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
