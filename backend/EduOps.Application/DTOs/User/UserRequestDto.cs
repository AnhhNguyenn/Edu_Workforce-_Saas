using System;

namespace EduOps.Application.DTOs.User
{
    public class UserRequestDto
    {
        public Guid? OrganizationId { get; set; } // Super Admin truyền vào, Center Admin thì hệ thống tự đè
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string Role { get; set; } = string.Empty; // SUPER_ADMIN, CENTER_ADMIN, TEACHER, ASSISTANT
        public string? Gender { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Address { get; set; }
    }
}
