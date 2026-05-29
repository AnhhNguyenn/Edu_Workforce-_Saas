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
                LessonTaught = report.LessonTaught,
                Progress = report.Progress,
                TeacherComment = report.TeacherComment,
                AssistantNote = report.AssistantNote,
                SpecialStudents = report.SpecialStudents,
                RatingForAssistant = report.RatingForAssistant,
                FeedbackForAssistant = report.FeedbackForAssistant,
                RatingForTeacher = report.RatingForTeacher,
                FeedbackForTeacher = report.FeedbackForTeacher,
                Status = report.Status,
                SubmittedAt = report.SubmittedAt,
                MediaUrls = media?.Select(m => m.FileUrl).ToList() ?? new System.Collections.Generic.List<string>()
            };
        }
    }
}
