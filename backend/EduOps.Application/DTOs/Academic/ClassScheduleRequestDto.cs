using System;

namespace EduOps.Application.DTOs.Academic
{
    public class ClassScheduleRequestDto
    {
        public int DayOfWeek { get; set; } // 1=Monday...7=Sunday
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public Guid TeacherId { get; set; }
        public Guid? AssistantId { get; set; }
    }
}
