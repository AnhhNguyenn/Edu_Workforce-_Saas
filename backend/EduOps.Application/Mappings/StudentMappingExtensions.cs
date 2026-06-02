using EduOps.Application.DTOs.Academic.Students.Responses;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class StudentMappingExtensions
    {
        public static StudentListResponseDto ToListResponseDto(this Student student)
        {
            if (student == null) return null!;

            return new StudentListResponseDto
            {
                Id = student.Id,
                FullName = student.FullName,
                StudentCode = student.StudentCode,
                StatusId = student.StatusId,
                StatusCode = student.Status?.Code ?? string.Empty
            };
        }

        public static StudentDetailResponseDto ToDetailResponseDto(this Student student)
        {
            if (student == null) return null!;

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
                CreatedAt = student.CreatedAt
            };
        }
    }
}
