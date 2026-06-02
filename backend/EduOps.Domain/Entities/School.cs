using System;
using System.Collections.Generic;

namespace EduOps.Domain.Entities
{
    public class School : TenantEntity
    {
        public string Name { get; set; } = string.Empty;
        public virtual SchoolDetail? SchoolDetail { get; set; }

        public virtual ICollection<Class> Classes { get; set; } = new List<Class>();
    }
}
