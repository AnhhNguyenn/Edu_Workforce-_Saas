using System;

namespace EduOps.Application.DTOs.Attendance
{
    public class AttendanceDto
    {
        public Guid Id { get; set; }
        public Guid SessionId { get; set; }
        public Guid UserId { get; set; }
        
        public DateTime? CheckinTime { get; set; }
        public DateTime? CheckoutTime { get; set; }
        
        public EduOps.Domain.Enums.AttendanceStatus Status { get; set; } = EduOps.Domain.Enums.AttendanceStatus.ABSENT;
        public int LateMinutes { get; set; }
        public int EarlyCheckoutMinutes { get; set; }
        public string? Note { get; set; }
    }
}
