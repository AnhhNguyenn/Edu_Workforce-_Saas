using EduOps.Application.DTOs.Academic;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class StudentMappingExtensions
    {
        public static StudentDto ToDto(this Student student)
        {
            return new StudentDto
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
