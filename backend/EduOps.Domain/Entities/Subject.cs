using System;

namespace EduOps.Domain.Entities
{
    public class Subject : TenantEntity
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
