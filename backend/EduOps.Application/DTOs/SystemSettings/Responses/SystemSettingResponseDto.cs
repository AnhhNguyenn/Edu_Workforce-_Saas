using System;

namespace EduOps.Application.DTOs.SystemSettings.Responses
{
    public class SystemSettingResponseDto
    {
        public Guid Id { get; set; }
        public string SettingKey { get; set; } = string.Empty;
        public string SettingValue { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ValueType { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
