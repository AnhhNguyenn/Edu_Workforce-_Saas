using System;
using System.Collections.Generic;
using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class Class : TenantEntity
    {
        public Guid SchoolId { get; set; }
        public virtual School? School { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid? GradeId { get; set; }
        public virtual Grade? Grade { get; set; }

        public string? AcademicYear { get; set; }

        public Guid? SubjectId { get; set; }
        public virtual Subject? Subject { get; set; }

        public virtual ClassDetail? ClassDetail { get; set; }

        public Guid? StatusId { get; set; }
        public virtual AccountStatus? Status { get; set; }

        public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();
        public virtual ICollection<ClassSchedule> ClassSchedules { get; set; } = new List<ClassSchedule>();
        public virtual ICollection<ClassEnrollment> Enrollments { get; set; } = new List<ClassEnrollment>();
    }
}
