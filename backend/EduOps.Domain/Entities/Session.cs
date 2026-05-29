using System;
using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class Session : TenantEntity
    {
        public Guid ClassId { get; set; }
        public Guid SchoolId { get; set; }
        public Guid TeacherId { get; set; }
        public Guid? AssistantId { get; set; }
        
        // Bổ sung: Liên kết tới lịch định kỳ gốc nếu có
        public Guid? ClassScheduleId { get; set; }
        
        public string LessonTitle { get; set; } = string.Empty;
        public string? LessonContent { get; set; }
        
        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        
        // SCHEDULED, ONGOING, COMPLETED, CANCELLED
        public SessionStatus Status { get; set; } = SessionStatus.SCHEDULED;
        
        public string? Note { get; set; }
        public Guid? CreatedBy { get; set; }
    }
}
