using EduOps.Application.DTOs.Report;
using EduOps.Domain.Entities;
using System.Linq;

namespace EduOps.Application.Mappings
{
    public static class ReportMappingExtensions
    {
        public static ReportDto ToDto(this Report report, System.Collections.Generic.List<ReportMedia> media)
        {
            if (report == null) return null!;

            return new ReportDto
            {
                Id = report.Id,
                SessionId = report.SessionId,
                TeacherId = report.TeacherId,
                AssistantId = report.AssistantId,
                AttendanceCount = report.AttendanceCount,
                AbsentCount = report.AbsentCount,
                LessonTaught = report.ReportDetail?.LessonTaught,
                Progress = report.ReportDetail?.Progress,
                TeacherComment = report.ReportDetail?.TeacherComment,
                AssistantNote = report.ReportDetail?.AssistantNote,
                SpecialStudents = report.ReportDetail?.SpecialStudents,
                RatingForAssistant = report.ReportDetail?.RatingForAssistant,
                FeedbackForAssistant = report.ReportDetail?.FeedbackForAssistant,
                RatingForTeacher = report.ReportDetail?.RatingForTeacher,
                FeedbackForTeacher = report.ReportDetail?.FeedbackForTeacher,
                StatusId = report.StatusId,
                StatusCode = report.Status?.Code ?? string.Empty,
                SubmittedAt = report.SubmittedAt,
                MediaUrls = media?.Select(m => m.FileUrl).ToList() ?? new System.Collections.Generic.List<string>()
            };
        }
    }
}
