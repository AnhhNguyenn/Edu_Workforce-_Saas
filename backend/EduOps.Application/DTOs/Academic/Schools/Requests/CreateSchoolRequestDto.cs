using System;
using System.ComponentModel.DataAnnotations;

namespace EduOps.Application.DTOs.Academic.Schools.Requests
{
    public class CreateSchoolRequestDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int AttendanceRadius { get; set; } = 200;
        public int LateThresholdMinutes { get; set; } = 15;
    }
}
