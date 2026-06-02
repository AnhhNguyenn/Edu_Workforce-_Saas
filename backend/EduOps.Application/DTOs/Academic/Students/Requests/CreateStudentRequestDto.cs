using System;

namespace EduOps.Application.DTOs.Academic.Students.Requests
{
    public class CreateStudentRequestDto
    {
        public string FullName { get; set; } = string.Empty;

        public string StudentCode { get; set; } = string.Empty;

        public DateTime? BirthDate { get; set; }
        public string ParentName { get; set; } = string.Empty;
        public string ParentPhone { get; set; } = string.Empty;
        public string ParentEmail { get; set; } = string.Empty;
    }
}
