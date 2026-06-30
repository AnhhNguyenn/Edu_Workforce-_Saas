using System;

namespace EduOps.Application.DTOs.Attendance
{
    public class AttendanceStatDto
    {
        public string Date { get; set; } = string.Empty;
        public int TotalSessions { get; set; }
        public int CheckedInCount { get; set; }
        public double AttendanceRate { get; set; }
    }
}
