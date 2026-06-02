using System;

namespace EduOps.Application.DTOs.Academic.Students.Responses
{
    public class StudentDetailResponseDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        public DateTime? BirthDate { get; set; }
        public string ParentName { get; set; } = string.Empty;
        public string ParentPhone { get; set; } = string.Empty;
        public string ParentEmail { get; set; } = string.Empty;
        public Guid? StatusId { get; set; }
        public string StatusCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
