using EduOps.Application.DTOs.Academic.Students.Responses;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class StudentMappingExtensions
    {
        public static StudentListResponseDto ToListResponseDto(this Student student)
        {
            if (student == null) return null!;

            var activeEnrollment = student.Enrollments?.FirstOrDefault(e => e.Status?.Code == "ENROLLED");

            return new StudentListResponseDto
            {
                Id = student.Id,
                FullName = student.FullName,
                StudentCode = student.StudentCode,
                DateOfBirth = student.StudentDetail?.BirthDate,
                PhoneNumber = student.StudentDetail?.ParentPhone ?? string.Empty,
                Email = student.StudentDetail?.ParentEmail ?? string.Empty,
                StatusId = student.StatusId,
                StatusCode = student.Status?.Code ?? string.Empty,
                CurrentClass = activeEnrollment?.Class?.Name ?? string.Empty,
                CurrentSchool = activeEnrollment?.Class?.School?.Name ?? string.Empty
            };
        }

        public static StudentDetailResponseDto ToDetailResponseDto(this Student student)
        {
            if (student == null) return null!;

            var activeEnrollment = student.Enrollments?.FirstOrDefault(e => e.Status?.Code == "ENROLLED");

            return new StudentDetailResponseDto
            {
                Id = student.Id,
                FullName = student.FullName,
                StudentCode = student.StudentCode,
                BirthDate = student.StudentDetail?.BirthDate,
                ParentName = student.StudentDetail?.ParentName ?? string.Empty,
                ParentPhone = student.StudentDetail?.ParentPhone ?? string.Empty,
                ParentEmail = student.StudentDetail?.ParentEmail ?? string.Empty,
                StatusId = student.StatusId,
                StatusCode = student.Status?.Code ?? string.Empty,
                CreatedAt = student.CreatedAt,
                ClassId = activeEnrollment?.ClassId,
                SchoolId = activeEnrollment?.Class?.SchoolId,
                CurrentClass = activeEnrollment?.Class?.Name ?? string.Empty,
                CurrentSchool = activeEnrollment?.Class?.School?.Name ?? string.Empty
            };
        }
    }
}
