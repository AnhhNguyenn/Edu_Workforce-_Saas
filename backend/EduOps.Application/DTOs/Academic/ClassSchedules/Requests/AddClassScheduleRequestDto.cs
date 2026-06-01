using System;
using System.ComponentModel.DataAnnotations;

namespace EduOps.Application.DTOs.Academic.ClassSchedules.Requests
{
    public class AddClassScheduleRequestDto
    {
        [Required]
        public DayOfWeek DayOfWeek { get; set; }
        
        [Required]
        public TimeSpan StartTime { get; set; }
        
        [Required]
        public TimeSpan EndTime { get; set; }
        
        [Required]
        public Guid TeacherId { get; set; }
        
        public Guid? AssistantId { get; set; }
    }
}
