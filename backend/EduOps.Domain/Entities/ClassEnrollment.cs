using System;

namespace EduOps.Domain.Entities
{
    public class ClassEnrollment : TenantEntity
    {
        public Guid ClassId { get; set; }
        public Guid StudentId { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public string Status { get; set; } = "ENROLLED"; // ENROLLED, DROPPED_OUT, COMPLETED
    }
}
