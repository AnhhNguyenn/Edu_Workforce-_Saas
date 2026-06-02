using System;

namespace EduOps.Domain.Entities
{
    public class ClassDetail : BaseEntity
    {
        public Guid ClassId { get; set; }
        public virtual Class? Class { get; set; }

        public string? Description { get; set; }
    }
}
