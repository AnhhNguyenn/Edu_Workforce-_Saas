using System;
using System.ComponentModel.DataAnnotations;

namespace EduOps.Application.DTOs.Organization.Requests
{
    public class CreateOrganizationRequestDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Phone { get; set; } = string.Empty;
        
        public string? Address { get; set; }
        
        public int MaxUsers { get; set; } = 50;
    }
}
