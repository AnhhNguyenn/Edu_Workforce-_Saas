using System;

namespace EduOps.Application.DTOs.User.Requests
{
    public class UpdateProfileRequestDto
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }
}
