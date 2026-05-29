using System;

namespace EduOps.Application.DTOs.Report
{
    public class TeacherReportRequestDto
    {
        public string? LessonTaught { get; set; }
        public string? Progress { get; set; }
        public string? TeacherComment { get; set; }
        public string? SpecialStudents { get; set; }
        
        // Đánh giá Trợ giảng
        public int? RatingForAssistant { get; set; }
        public string? FeedbackForAssistant { get; set; }
    }
}
