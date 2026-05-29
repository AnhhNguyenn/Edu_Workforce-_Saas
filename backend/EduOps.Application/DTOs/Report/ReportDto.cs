using System;
using System.Collections.Generic;
using EduOps.Domain.Enums;

namespace EduOps.Application.DTOs.Report
{
    public class ReportDto
    {
        public Guid Id { get; set; }
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
        
        public int? RatingForTeacher { get; set; }
        public string? FeedbackForTeacher { get; set; }
        public int? RatingForAssistant { get; set; }
        public string? FeedbackForAssistant { get; set; }
        public ReportStatus Status { get; set; } = ReportStatus.DRAFT;
        public DateTime? SubmittedAt { get; set; }
        
        public List<string> MediaUrls { get; set; } = new List<string>();
    }
}
