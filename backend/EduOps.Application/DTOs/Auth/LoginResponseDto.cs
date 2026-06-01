using System;

using EduOps.Application.DTOs.User.Responses;

namespace EduOps.Application.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UserDetailResponseDto User { get; set; } = new UserDetailResponseDto();
    }
}
