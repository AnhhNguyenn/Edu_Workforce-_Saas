using EduOps.Application.DTOs.Academic.Schools.Responses;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class SchoolMappingExtensions
    {
        public static SchoolListResponseDto ToListResponseDto(this School school)
        {
            if (school == null) return null!;

            return new SchoolListResponseDto
            {
                Id = school.Id,
                Name = school.Name,
                Address = school.Address
            };
        }

        public static SchoolDetailResponseDto ToDetailResponseDto(this School school)
        {
            if (school == null) return null!;

            return new SchoolDetailResponseDto
            {
                Id = school.Id,
                OrganizationId = school.OrganizationId ?? System.Guid.Empty,
                Name = school.Name,
                Address = school.Address,
                Latitude = school.Latitude,
                Longitude = school.Longitude,
                AttendanceRadius = school.AttendanceRadius,
                LateThresholdMinutes = school.LateThresholdMinutes,
                EarlyCheckoutMinutes = school.EarlyCheckoutMinutes
            };
        }
    }
}
