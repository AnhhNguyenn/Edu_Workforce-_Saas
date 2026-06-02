using System;

using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class StudentSessionAttendance : TenantEntity
    {
        public Guid SessionId { get; set; }
        public Guid StudentId { get; set; }
        public bool IsPresent { get; set; }

        public Guid? StatusId { get; set; }
        public virtual AttendanceStatus? Status { get; set; }

        public string? Note { get; set; }
    }
}
