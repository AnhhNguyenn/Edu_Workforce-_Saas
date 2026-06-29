using System;

namespace EduOps.Application.DTOs.Academic.Students.Responses
{
    public class StudentListResponseDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Guid? StatusId { get; set; }
        public string StatusCode { get; set; } = string.Empty;
        public string CurrentClass { get; set; } = string.Empty;
        public string CurrentSchool { get; set; } = string.Empty;
    }
}
