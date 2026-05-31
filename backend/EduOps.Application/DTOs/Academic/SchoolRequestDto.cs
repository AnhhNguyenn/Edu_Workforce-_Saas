using System;

namespace EduOps.Application.DTOs.Academic
{
    public class SchoolRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int AttendanceRadius { get; set; } = 200;
        public int LateThresholdMinutes { get; set; } = 15;
        public int EarlyCheckoutMinutes { get; set; } = 10;
    }
}
