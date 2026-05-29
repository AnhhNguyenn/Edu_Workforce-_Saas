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
        
        // SUPER_ADMIN, CENTER_ADMIN, TEACHER, ASSISTANT
        public string Role { get; set; } = string.Empty; 
        
        // Lệnh mới: File avatar có thể lưu bằng đường dẫn R2 Cloudflare
        public string? AvatarUrl { get; set; } 
        
        public string? Gender { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Address { get; set; }
        
        // ACTIVE, INACTIVE, SUSPENDED
        public string Status { get; set; } = "ACTIVE";
        
        public DateTime? LastLoginAt { get; set; }
        
        // Thời gian kết thúc khóa tài khoản. Nếu là DateTime.MaxValue nghĩa là khóa vĩnh viễn.
        public DateTime? LockEndAt { get; set; }

        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
    }
}
