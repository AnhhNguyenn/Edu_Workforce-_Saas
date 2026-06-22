using System;
using System.Collections.Generic;

namespace EduOps.Application.DTOs.Academic.Sessions.Requests
{
    public class BatchCreateSessionRequestDto
    {
        public List<Guid> ClassIds { get; set; } = new List<Guid>();
        public Guid? SchoolId { get; set; }
        public Guid? TeacherId { get; set; }
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

        public bool IsRecurring { get; set; }
        public List<int>? RecurringDaysOfWeek { get; set; }
        public DateTime? RecurringEndDate { get; set; }
    }
}
