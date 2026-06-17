using System;

namespace EduOps.Application.DTOs.Academic.Schools.Responses
{
    public class SchoolListResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int? GpsRadius { get; set; }
    }
}
