using System;

namespace EduOps.Application.DTOs.Academic.Sessions.Responses
{
    public class SessionDetailResponseDto
    {
        public Guid Id { get; set; }
        public Guid ClassId { get; set; }
        public Guid? GroupId { get; set; }
        public Guid? TeacherId { get; set; }
        public List<Guid>? TeacherIds { get; set; }
        public List<Guid>? AssistantIds { get; set; }
        public string LessonTitle { get; set; } = string.Empty;
        public string? RoomName { get; set; }
        public string? Notes { get; set; }
        public int? ActualStudentCount { get; set; }
        public string? ExtraData { get; set; }
        public string? LocalTeachingAssistant { get; set; }
        public string? LessonProgress { get; set; }
        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public Guid? StatusId { get; set; }
        public string StatusCode { get; set; } = string.Empty;
    }
}
