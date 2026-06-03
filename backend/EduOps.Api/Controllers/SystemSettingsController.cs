using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs.SystemSettings.Requests;
using EduOps.Application.DTOs.SystemSettings.Responses;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SystemSettingsController : ControllerBase
    {
        private readonly ISystemSettingService _settingService;

        public SystemSettingsController(ISystemSettingService settingService)
        {
            _settingService = settingService;
        }

        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<ActionResult<List<SystemSettingResponseDto>>> GetPublicSettings()
        {
            return Ok(await _settingService.GetPublicSettingsAsync());
        }

        [HttpGet]
        [Authorize(Roles = "SUPER_ADMIN")]
        public async Task<ActionResult<List<SystemSettingResponseDto>>> GetAllSettings()
        {
            return Ok(await _settingService.GetAllSettingsAsync());
        }

        [HttpPut("{key}")]
        [Authorize(Roles = "SUPER_ADMIN")]
        public async Task<IActionResult> UpdateSetting(string key, [FromBody] SystemSettingUpdateRequestDto request)
        {
            await _settingService.UpdateSettingAsync(key, request);
            return NoContent();
        }

        [HttpGet("audit-logs")]
        [Authorize(Roles = "SUPER_ADMIN")]
        public async Task<ActionResult<List<AuditLogResponseDto>>> GetAuditLogs()
        {
            return Ok(await _settingService.GetAuditLogsAsync());
        }
    }
}
