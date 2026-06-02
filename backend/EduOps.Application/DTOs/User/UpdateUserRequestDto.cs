using System;

namespace EduOps.Application.DTOs.User
{
    public class UpdateUserRequestDto
    {
        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty; // SUPER_ADMIN, CENTER_ADMIN, TEACHER, ASSISTANT

        public string? Gender { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Address { get; set; }
    }
}
