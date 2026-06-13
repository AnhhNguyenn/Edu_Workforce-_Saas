using System;

namespace EduOps.Application.DTOs.Academic
{
    public class SessionDto
    {
        public Guid Id { get; set; }
        public Guid ClassId { get; set; }
        public Guid? TeacherId { get; set; }
        public Guid? AssistantId { get; set; }
        public string LessonTitle { get; set; } = string.Empty;
        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public EduOps.Domain.Enums.SessionStatus Status { get; set; } = EduOps.Domain.Enums.SessionStatus.SCHEDULED;
    }
}
