using System;

namespace EduOps.Application.DTOs.Academic.Classes.Requests
{
    public class CreateClassRequestDto
    {
        public Guid SchoolId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Grade { get; set; }
        public string? Subject { get; set; }
        public string? AcademicYear { get; set; }
        public string? Description { get; set; }
    }
}
