using System;
using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class Session : TenantEntity
    {
        public Guid ClassId { get; set; }
        public Guid SchoolId { get; set; }
        public Guid? TeacherId { get; set; }
        public Guid? AssistantId { get; set; }

        // Bổ sung: Liên kết tới lịch định kỳ gốc nếu có
        public Guid? ClassScheduleId { get; set; }
        public string LessonTitle { get; set; } = string.Empty;
        public string? RoomName { get; set; }
        public virtual SessionDetail? SessionDetail { get; set; }

        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public Guid? StatusId { get; set; }
        public virtual SessionStatus? Status { get; set; }

        public Guid? CreatedBy { get; set; }
    }
}
