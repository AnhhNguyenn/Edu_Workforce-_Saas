using EduOps.Application.DTOs.Academic;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class ClassMappingExtensions
    {
        public static ClassDto ToDto(this Class c)
        {
            if (c == null) return null!;

            return new ClassDto
            {
                Id = c.Id,
                SchoolId = c.SchoolId,
                Name = c.Name,
                Grade = c.Grade,
                Subject = c.Subject,
                Description = c.Description,
                Status = c.Status
            };
        }
    }
}
