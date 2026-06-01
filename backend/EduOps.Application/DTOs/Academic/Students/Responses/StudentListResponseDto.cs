using System;

namespace EduOps.Application.DTOs.Academic.Students.Responses
{
    public class StudentListResponseDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
