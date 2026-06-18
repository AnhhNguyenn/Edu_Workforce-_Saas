using System;

namespace EduOps.Application.DTOs.Academic
{
    public class SessionRequestDto
    {
        public Guid ClassId { get; set; }
        public Guid SchoolId { get; set; }
        public Guid? TeacherId { get; set; }
        public Guid? AssistantId { get; set; }
        public string LessonTitle { get; set; } = string.Empty;
        public string? RoomName { get; set; }
        public string? Notes { get; set; }
        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}
