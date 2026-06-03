using System;

using EduOps.Application.DTOs.User.Responses;

namespace EduOps.Application.DTOs.Auth
{
    public class LoginResponseDto
    {
        public bool Requires2FA { get; set; } = false;
        public string? TempToken { get; set; }

        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public UserDetailResponseDto? User { get; set; }
    }
}
