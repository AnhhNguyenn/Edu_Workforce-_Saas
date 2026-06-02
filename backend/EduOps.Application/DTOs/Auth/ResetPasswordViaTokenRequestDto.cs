namespace EduOps.Application.DTOs.Auth
{
    public class ResetPasswordViaTokenRequestDto
    {
        public string Token { get; set; } = string.Empty;

        public string NewPassword { get; set; } = string.Empty;
    }
}
