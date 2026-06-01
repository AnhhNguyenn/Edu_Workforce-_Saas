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
                Status = student.Status.ToString()
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
                BirthDate = student.BirthDate,
                ParentName = student.ParentName,
                ParentPhone = student.ParentPhone,
                ParentEmail = student.ParentEmail,
                Status = student.Status.ToString(),
                CreatedAt = student.CreatedAt
            };
        }
    }
}
