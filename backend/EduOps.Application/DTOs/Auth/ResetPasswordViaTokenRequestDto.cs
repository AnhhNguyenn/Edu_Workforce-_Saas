using System.ComponentModel.DataAnnotations;

namespace EduOps.Application.DTOs.Auth
{
    public class ResetPasswordViaTokenRequestDto
    {
        [Required(ErrorMessage = "Mã xác nhận (Token) không được để trống")]
        public string Token { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu mới không được để trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string NewPassword { get; set; } = string.Empty;
    }
}
