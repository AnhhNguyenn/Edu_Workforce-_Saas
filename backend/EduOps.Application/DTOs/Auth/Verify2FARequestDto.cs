using System.ComponentModel.DataAnnotations;

namespace EduOps.Application.DTOs.Auth
{
    public class Verify2FARequestDto
    {
        [Required]
        public string TempToken { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;
    }
}
