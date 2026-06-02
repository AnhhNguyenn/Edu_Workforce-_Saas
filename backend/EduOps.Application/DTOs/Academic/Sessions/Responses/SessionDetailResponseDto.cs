using System;

namespace EduOps.Application.DTOs.Academic.Sessions.Responses
{
    public class SessionDetailResponseDto
    {
        public Guid Id { get; set; }
        public Guid ClassId { get; set; }
        public Guid TeacherId { get; set; }
        public Guid? AssistantId { get; set; }
        public string LessonTitle { get; set; } = string.Empty;
        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public Guid? StatusId { get; set; }
        public string StatusCode { get; set; } = string.Empty;
    }
}
