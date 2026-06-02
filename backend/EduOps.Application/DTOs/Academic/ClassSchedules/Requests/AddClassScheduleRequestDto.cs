using System;

namespace EduOps.Application.DTOs.Academic.ClassSchedules.Requests
{
    public class AddClassScheduleRequestDto
    {
        public DayOfWeek DayOfWeek { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public Guid TeacherId { get; set; }

        public Guid? AssistantId { get; set; }
    }
}
