using EduOps.Application.DTOs.Academic;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class SchoolMappingExtensions
    {
        public static SchoolDto ToDto(this School school)
        {
            if (school == null) return null!;

            return new SchoolDto
            {
                Id = school.Id,
                OrganizationId = school.OrganizationId ?? System.Guid.Empty,
                Name = school.Name,
                Address = school.Address,
                Latitude = school.Latitude,
                Longitude = school.Longitude,
                AttendanceRadius = school.AttendanceRadius,
                LateThresholdMinutes = school.LateThresholdMinutes
            };
        }
    }
}
