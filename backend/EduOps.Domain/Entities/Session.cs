using System;
using System.Collections.Generic;
using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class Session : TenantEntity
    {
        public Guid ClassId { get; set; }
        public Guid SchoolId { get; set; }
        public Guid? TeacherId { get; set; }
        public Guid? AssistantId { get; set; }

        // Bổ sung: Liên kết nhóm cho gộp lớp
        public Guid? GroupId { get; set; }

        // Bổ sung: Liên kết tới lịch định kỳ gốc nếu có
        public Guid? ClassScheduleId { get; set; }
        public string LessonTitle { get; set; } = string.Empty;
        public string? RoomName { get; set; }
        public string? Notes { get; set; }
        
        // Bổ sung cho Báo cáo Trợ giảng
        public string? LocalTeachingAssistant { get; set; }
        public string? LessonProgress { get; set; }
        
        // Sĩ số thực tế từ Excel
        public int? ActualStudentCount { get; set; }

        // Dữ liệu mở rộng (Custom Fields) dạng JSON
        public string? ExtraData { get; set; }

        public virtual SessionDetail? SessionDetail { get; set; }
        public virtual ICollection<SessionAssistant> SessionAssistants { get; set; } = new List<SessionAssistant>();
        public virtual ICollection<SessionTeacher> SessionTeachers { get; set; } = new List<SessionTeacher>();

        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public Guid? StatusId { get; set; }
        public virtual SessionStatus? Status { get; set; }
    }
}
