using System;

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
        
        // DRAFT, SUBMITTED, FINALIZED
        public string Status { get; set; } = "DRAFT";
        
        public DateTime? SubmittedAt { get; set; }
        public DateTime? FinalizedAt { get; set; }
    }
}
