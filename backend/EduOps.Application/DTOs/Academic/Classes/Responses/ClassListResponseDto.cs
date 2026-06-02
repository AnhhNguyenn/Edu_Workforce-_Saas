using System;
using EduOps.Domain.Enums;

namespace EduOps.Application.DTOs.Academic.Classes.Responses
{
    public class ClassListResponseDto
    {
        public Guid Id { get; set; }
        public Guid SchoolId { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid? GradeId { get; set; }
        public string? GradeCode { get; set; }
        public Guid? SubjectId { get; set; }
        public string? SubjectCode { get; set; }
        public Guid? StatusId { get; set; }
        public string StatusCode { get; set; } = string.Empty;
    }
}
