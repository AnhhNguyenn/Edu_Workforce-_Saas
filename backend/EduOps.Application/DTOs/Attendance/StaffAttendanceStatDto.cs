using System;

namespace EduOps.Application.DTOs.Attendance
{
    public class StaffAttendanceStatDto
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        
        // Chỉ số chuyên cần
        public int TotalSessions { get; set; }
        public int CheckedInCount { get; set; }
        public int LateCount { get; set; }
        public int EarlyCheckoutCount { get; set; }
        public int MissingCheckoutCount { get; set; }
        public int AbsentCount { get; set; }
        
        public double AttendanceRate { get; set; }
    }
}
