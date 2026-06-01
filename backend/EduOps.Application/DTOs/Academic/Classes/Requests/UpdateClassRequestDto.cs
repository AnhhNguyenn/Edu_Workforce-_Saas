using System;
using System.ComponentModel.DataAnnotations;

namespace EduOps.Application.DTOs.Academic.Classes.Requests
{
    public class UpdateClassRequestDto
    {
        [Required]
        public Guid SchoolId { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? Grade { get; set; }
        public string? Subject { get; set; }
        public string? Description { get; set; }
    }
}
