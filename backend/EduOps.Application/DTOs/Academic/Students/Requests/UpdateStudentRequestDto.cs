using System;
using System.ComponentModel.DataAnnotations;

namespace EduOps.Application.DTOs.Academic.Students.Requests
{
    public class UpdateStudentRequestDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;
        
        // StudentCode is removed as it's immutable
        
        public DateTime? BirthDate { get; set; }
        public string ParentName { get; set; } = string.Empty;
        public string ParentPhone { get; set; } = string.Empty;
        public string ParentEmail { get; set; } = string.Empty;
    }
}
