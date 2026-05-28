using System;

namespace EduOps.Application.DTOs.Auth
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public Guid? OrganizationId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? LastLoginAt { get; set; }
        public DateTime? LockEndAt { get; set; }
    }
}
