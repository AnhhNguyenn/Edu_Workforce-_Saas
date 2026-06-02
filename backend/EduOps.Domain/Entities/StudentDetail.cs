using System;

namespace EduOps.Domain.Entities
{
    public class StudentDetail : BaseEntity
    {
        public Guid StudentId { get; set; }
        public virtual Student? Student { get; set; }

        public DateTime? BirthDate { get; set; }
        public string? ParentName { get; set; }
        public string? ParentPhone { get; set; }
        public string? ParentEmail { get; set; }
    }
}
