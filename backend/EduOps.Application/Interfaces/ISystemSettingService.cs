using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs.SystemSettings.Requests;
using EduOps.Application.DTOs.SystemSettings.Responses;

namespace EduOps.Application.Interfaces
{
    public interface ISystemSettingService
    {
        Task<List<SystemSettingResponseDto>> GetAllSettingsAsync();
        Task<List<SystemSettingResponseDto>> GetPublicSettingsAsync();
        Task<string?> GetSettingValueAsync(string key);
        Task<bool> IsFeatureEnabledAsync(string featureKey);
        Task UpdateSettingAsync(string key, SystemSettingUpdateRequestDto request);
    }
}
