using System;

namespace EduOps.Application.DTOs.Academic
{
    public class SchoolDto
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int AttendanceRadius { get; set; }
        public int LateThresholdMinutes { get; set; }
    }
}
