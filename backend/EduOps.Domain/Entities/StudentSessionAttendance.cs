using System;

namespace EduOps.Domain.Entities
{
    public class StudentSessionAttendance : TenantEntity
    {
        public Guid SessionId { get; set; }
        public Guid StudentId { get; set; }
        
        // PRESENT, ABSENT, EXCUSED
        public string Status { get; set; } = "PRESENT";
        
        public string? Note { get; set; }
    }
}
