using System;

namespace EduOps.Application.DTOs.SystemBroadcast
{
    public class SystemBroadcastDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "info";
        public string? ActionLink { get; set; }
        public string? TargetRoles { get; set; }
        public int TargetPercentage { get; set; }
        public bool IsSent { get; set; }
        public DateTime? SentAt { get; set; }
        public bool IsRecalled { get; set; }
        public DateTime? RecalledAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
