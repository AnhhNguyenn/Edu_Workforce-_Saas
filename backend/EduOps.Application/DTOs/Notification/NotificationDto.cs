using System;

namespace EduOps.Application.DTOs.Notification
{
    public class NotificationDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // SYSTEM, REMINDER, ALERT
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
