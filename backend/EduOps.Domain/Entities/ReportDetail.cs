using System;

namespace EduOps.Domain.Entities
{
    public class ReportDetail : BaseEntity
    {
        public Guid ReportId { get; set; }
        public virtual Report? Report { get; set; }

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
    }
}
