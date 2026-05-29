using System.ComponentModel.DataAnnotations;

namespace EduOps.Application.DTOs.User
{
    public class ResetPasswordRequestDto
    {
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }
}
