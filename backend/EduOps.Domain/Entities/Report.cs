using System;

using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class Report : TenantEntity
    {
        public Guid SessionId { get; set; }
        public Guid TeacherId { get; set; }
        public Guid? AssistantId { get; set; }
        
        public int AttendanceCount { get; set; }
        public int AbsentCount { get; set; }
        
        public string? LessonTaught { get; set; }
        public string? Progress { get; set; }
        public string? TeacherComment { get; set; }
        public string? AssistantNote { get; set; }
        public string? SpecialStudents { get; set; }
        
        // Đánh giá chéo (Cross-Evaluation)
        public int? RatingForAssistant { get; set; }
        public string? FeedbackForAssistant { get; set; }
        public int? RatingForTeacher { get; set; }
        public string? FeedbackForTeacher { get; set; }
        
        // DRAFT, SUBMITTED, FINALIZED
        public ReportStatus Status { get; set; } = ReportStatus.DRAFT;
        
        public DateTime? SubmittedAt { get; set; }
        public DateTime? FinalizedAt { get; set; }
    }
}
