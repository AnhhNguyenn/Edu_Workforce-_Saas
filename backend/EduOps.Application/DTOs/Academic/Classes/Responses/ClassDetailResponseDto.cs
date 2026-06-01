using System;

namespace EduOps.Application.DTOs.Academic.Classes.Responses
{
    public class ClassDetailResponseDto
    {
        public Guid Id { get; set; }
        public Guid SchoolId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Grade { get; set; }
        public string? Subject { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
