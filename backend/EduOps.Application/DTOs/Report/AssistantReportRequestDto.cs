using System;

namespace EduOps.Application.DTOs.Report
{
    public class AssistantReportRequestDto
    {
        public string? AssistantNote { get; set; }
        
        // Đánh giá Giáo viên
        public int? RatingForTeacher { get; set; }
        public string? FeedbackForTeacher { get; set; }
    }
}
