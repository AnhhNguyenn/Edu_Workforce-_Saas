using System;

using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class StudentSessionAttendance : TenantEntity
    {
        public Guid SessionId { get; set; }
        public Guid StudentId { get; set; }
        public bool IsPresent { get; set; }
        
        public AttendanceStatus Status { get; set; } = AttendanceStatus.PRESENT;
        
        public string? Note { get; set; }
    }
}
