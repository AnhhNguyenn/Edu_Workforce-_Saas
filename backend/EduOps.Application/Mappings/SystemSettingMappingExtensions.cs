using EduOps.Application.DTOs.SystemSettings.Responses;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class SystemSettingMappingExtensions
    {
        public static SystemSettingResponseDto ToResponseDto(this SystemSetting setting)
        {
            if (setting == null) return null!;

            return new SystemSettingResponseDto
            {
                Id = setting.Id,
                SettingKey = setting.SettingKey,
                SettingValue = setting.SettingValue,
                Description = setting.Description,
                ValueType = setting.ValueType.ToString(),
                IsPublic = setting.IsPublic,
                UpdatedAt = setting.UpdatedAt
            };
        }
    }
}
