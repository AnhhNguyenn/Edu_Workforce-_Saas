using System;

namespace EduOps.Domain.Entities
{
    public class SchoolDetail : BaseEntity
    {
        public Guid SchoolId { get; set; }
        public virtual School? School { get; set; }

        public string? Address { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        public int AttendanceRadius { get; set; } = 200; // in meters
        public int LateThresholdMinutes { get; set; } = 15;
        public int EarlyCheckoutMinutes { get; set; } = 10;
    }
}
