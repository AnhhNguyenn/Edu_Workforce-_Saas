using System;

namespace EduOps.Domain.Entities
{
    public class ReportStatus : BaseEntity
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
