using System;

namespace EduOps.Application.DTOs.Academic
{
    public class ClassRequestDto
    {
        public Guid SchoolId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Grade { get; set; }
        public string? Subject { get; set; }
        public string? Description { get; set; }
        public EduOps.Domain.Enums.AccountStatus? Status { get; set; }
    }
}
