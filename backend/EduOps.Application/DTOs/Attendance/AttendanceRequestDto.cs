using System;

namespace EduOps.Application.DTOs.Attendance
{
    public class AttendanceRequestDto
    {
        public Guid SessionId { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public bool IsMockLocation { get; set; }
        public string? DeviceId { get; set; }
        public string? Note { get; set; }
    }
}
