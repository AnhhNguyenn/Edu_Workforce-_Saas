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
                Name = c.Name,
                Grade = c.Grade,
                Subject = c.Subject,
                Status = c.Status.ToString()
            };
        }

        public static ClassDetailResponseDto ToDetailResponseDto(this Class c)
        {
            if (c == null) return null!;

            return new ClassDetailResponseDto
            {
                Id = c.Id,
                SchoolId = c.SchoolId,
                Name = c.Name,
                Grade = c.Grade,
                Subject = c.Subject,
                Description = c.Description,
                Status = c.Status.ToString(),
                CreatedAt = c.CreatedAt
            };
        }
    }
}
