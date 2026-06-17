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
                Address = school.SchoolDetail?.Address,
                Latitude = school.SchoolDetail?.Latitude,
                Longitude = school.SchoolDetail?.Longitude,
                GpsRadius = school.SchoolDetail?.AttendanceRadius
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
                Address = school.SchoolDetail?.Address,
                Latitude = school.SchoolDetail?.Latitude,
                Longitude = school.SchoolDetail?.Longitude,
                AttendanceRadius = school.SchoolDetail?.AttendanceRadius ?? 200,
                LateThresholdMinutes = school.SchoolDetail?.LateThresholdMinutes ?? 15
            };
        }
    }
}
