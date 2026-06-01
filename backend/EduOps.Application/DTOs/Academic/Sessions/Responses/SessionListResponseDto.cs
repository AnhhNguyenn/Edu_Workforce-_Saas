using System;

namespace EduOps.Application.DTOs.Academic.Sessions.Responses
{
    public class SessionListResponseDto
    {
        public Guid Id { get; set; }
        public Guid ClassId { get; set; }
        public string LessonTitle { get; set; } = string.Empty;
        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
