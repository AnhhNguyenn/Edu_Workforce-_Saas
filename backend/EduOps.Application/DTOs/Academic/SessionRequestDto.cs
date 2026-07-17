using System;

namespace EduOps.Application.DTOs.Academic
{
    public class SessionRequestDto
    {
        public List<Guid> ClassIds { get; set; } = new List<Guid>();
        public Guid SchoolId { get; set; }
        public Guid? TeacherId { get; set; }
        public List<Guid>? TeacherIds { get; set; }
        public List<Guid>? AssistantIds { get; set; }
        public string LessonTitle { get; set; } = string.Empty;
        public string? RoomName { get; set; }
        public string? Notes { get; set; }
        public int? ActualStudentCount { get; set; }
        public string? LocalTeachingAssistant { get; set; }
        public string? LessonProgress { get; set; }
        public string? ExtraData { get; set; }
        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}
