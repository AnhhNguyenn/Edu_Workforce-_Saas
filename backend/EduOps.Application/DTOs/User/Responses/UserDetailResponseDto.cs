using System;
using EduOps.Domain.Enums;

namespace EduOps.Application.DTOs.User.Responses
{
    public class UserDetailResponseDto
    {
        public Guid Id { get; set; }
        public Guid? OrganizationId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Guid? RoleId { get; set; }
        public string RoleCode { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public Guid? StatusId { get; set; }
        public string StatusCode { get; set; } = string.Empty;
        public DateTime? LastLoginAt { get; set; }
        public DateTime? LockEndAt { get; set; }
    }
}
