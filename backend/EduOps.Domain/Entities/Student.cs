using System;
using System.Collections.Generic;
using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class Student : TenantEntity
    {
        public string FullName { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        public virtual StudentDetail? StudentDetail { get; set; }

        public Guid? StatusId { get; set; }
        public virtual AccountStatus? Status { get; set; }

        public virtual ICollection<ClassEnrollment> Enrollments { get; set; } = new List<ClassEnrollment>();
        public virtual ICollection<StudentSessionAttendance> Attendances { get; set; } = new List<StudentSessionAttendance>();
    }
}
