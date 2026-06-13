using System;

namespace EduOps.Application.DTOs.Academic.Sessions.Requests
{
    public class CreateSessionRequestDto
    {
        public Guid ClassId { get; set; }
        public Guid SchoolId { get; set; }
        public Guid? TeacherId { get; set; }

        public Guid? AssistantId { get; set; }
        public string LessonTitle { get; set; } = string.Empty;
        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}
