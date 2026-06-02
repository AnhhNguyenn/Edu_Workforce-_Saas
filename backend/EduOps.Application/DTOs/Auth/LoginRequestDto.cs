using System;
using System.ComponentModel.DataAnnotations;

namespace EduOps.Application.DTOs.Auth
{
    public class LoginRequestDto
    {
        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
    }
}
