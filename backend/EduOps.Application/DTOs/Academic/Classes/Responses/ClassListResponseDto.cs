using System;
using EduOps.Domain.Enums;

namespace EduOps.Application.DTOs.Academic.Classes.Responses
{
    public class ClassListResponseDto
    {
        public Guid Id { get; set; }
        public Guid SchoolId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Grade { get; set; }
        public string? Subject { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
