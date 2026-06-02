using System;

namespace EduOps.Domain.Entities
{
    public class ClassEnrollment : TenantEntity
    {
        public Guid ClassId { get; set; }
        public Guid StudentId { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public Guid? StatusId { get; set; }
        public virtual EnrollmentStatus? Status { get; set; }
    }
}
