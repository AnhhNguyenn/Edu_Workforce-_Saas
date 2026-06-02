using System;
using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class User : TenantEntity
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        public Guid? RoleId { get; set; }
        public virtual Role? Role { get; set; }

        public virtual UserDetail? UserDetail { get; set; }

        public Guid? StatusId { get; set; }
        public virtual AccountStatus? Status { get; set; }

        public DateTime? LastLoginAt { get; set; }

        // Thời gian kết thúc khóa tài khoản. Nếu là DateTime.MaxValue nghĩa là khóa vĩnh viễn.
        public DateTime? LockEndAt { get; set; }

        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        public string? ResetPasswordToken { get; set; }
        public DateTime? ResetPasswordTokenExpiryTime { get; set; }
    }
}
