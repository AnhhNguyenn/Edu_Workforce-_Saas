using System.Collections.Generic;

namespace EduOps.Application.DTOs.Academic.Students.Responses
{
    public class StudentImportResultDto
    {
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}
