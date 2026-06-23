using System.ComponentModel.DataAnnotations;

namespace EduOps.Application.DTOs.SystemBroadcast
{
    public class CreateSystemBroadcastDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public string Type { get; set; } = "info";
        
        public string? ActionLink { get; set; }
        
        public string? TargetRoles { get; set; }
        
        [Range(0, 100)]
        public int TargetPercentage { get; set; } = 100;
    }
}
