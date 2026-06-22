using System;
using System.Collections.Generic;

namespace EduOps.Application.DTOs.Academic.Sessions.Responses
{
    public class SessionImportPreviewResponseDto
    {
        public List<NewUserPreviewDto> UsersToCreate { get; set; } = new();
        public List<NewSchoolPreviewDto> SchoolsToCreate { get; set; } = new();
        public List<NewClassPreviewDto> ClassesToCreate { get; set; } = new();
        public List<NewCustomFieldPreviewDto> CustomFieldsToCreate { get; set; } = new();
        public List<SessionPreviewDto> Sessions { get; set; } = new();
    }

    public class NewUserPreviewDto
    {
        public string? TempId { get; set; } = Guid.NewGuid().ToString();
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RoleCode { get; set; } = string.Empty; // TEACHER or ASSISTANT
        public string DefaultPassword { get; set; } = "123456";
    }

    public class NewSchoolPreviewDto
    {
        public string? TempId { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
    }

    public class NewClassPreviewDto
    {
        public string? TempId { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string SchoolName { get; set; } = string.Empty;
        public string? SchoolTempId { get; set; }
    }

    public class NewCustomFieldPreviewDto
    {
        public string? TempId { get; set; } = Guid.NewGuid().ToString();
        public string FieldName { get; set; } = string.Empty;
    }

    public class SessionPreviewDto
    {
        public string TempId { get; set; } = Guid.NewGuid().ToString();
        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string? ClassTempId { get; set; }
        public string SchoolName { get; set; } = string.Empty;
        public string? SchoolTempId { get; set; }
        
        public string? TeacherName { get; set; }
        public string? TeacherTempId { get; set; }
        
        public List<string> AssistantNames { get; set; } = new();
        public List<string> AssistantTempIds { get; set; } = new();

        public int? ActualStudentCount { get; set; }
        public string? LocalTeachingAssistant { get; set; }
        public string? LessonProgress { get; set; }
        public string? Notes { get; set; }
        public Dictionary<string, string> ExtraData { get; set; } = new();
        
        public List<string> Errors { get; set; } = new();
    }
}
