using System;

namespace EduOps.Application.DTOs.Academic.Classes.Responses
{
    public class ClassDetailResponseDto
    {
        public Guid Id { get; set; }
        public Guid SchoolId { get; set; }
        public string SchoolName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public Guid? GradeId { get; set; }
        public string? GradeCode { get; set; }
        public string? AcademicYear { get; set; }
        public Guid? SubjectId { get; set; }
        public string? SubjectCode { get; set; }
        public string? Description { get; set; }
        public Guid? StatusId { get; set; }
        public string StatusCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
