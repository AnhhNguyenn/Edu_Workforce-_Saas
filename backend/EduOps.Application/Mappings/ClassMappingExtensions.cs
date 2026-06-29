using EduOps.Application.DTOs.Academic.Classes.Responses;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class ClassMappingExtensions
    {
        public static ClassListResponseDto ToListResponseDto(this Class c)
        {
            if (c == null) return null!;

            return new ClassListResponseDto
            {
                Id = c.Id,
                SchoolId = c.SchoolId,
                SchoolName = c.School?.Name ?? string.Empty,
                Name = c.Name,
                GradeId = c.GradeId,
                GradeCode = c.Grade?.Code,
                AcademicYear = c.AcademicYear,
                SubjectId = c.SubjectId,
                SubjectCode = c.Subject?.Code,
                StatusId = c.StatusId,
                StatusCode = c.Status?.Code ?? string.Empty,
                StudentsCount = c.Enrollments?.Count(e => e.Status == null || e.Status.Code == "ENROLLED") ?? 0
            };
        }

        public static ClassDetailResponseDto ToDetailResponseDto(this Class c)
        {
            if (c == null) return null!;

            return new ClassDetailResponseDto
            {
                Id = c.Id,
                SchoolId = c.SchoolId,
                SchoolName = c.School?.Name ?? string.Empty,
                Name = c.Name,
                GradeId = c.GradeId,
                GradeCode = c.Grade?.Code,
                AcademicYear = c.AcademicYear,
                SubjectId = c.SubjectId,
                SubjectCode = c.Subject?.Code,
                Description = c.ClassDetail?.Description,
                StatusId = c.StatusId,
                StatusCode = c.Status?.Code ?? string.Empty,
                CreatedAt = c.CreatedAt
            };
        }
    }
}
