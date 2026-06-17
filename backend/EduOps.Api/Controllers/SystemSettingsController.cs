using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs.SystemSettings.Requests;
using EduOps.Application.DTOs.SystemSettings.Responses;
using EduOps.Application.Interfaces;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduOps.Api.Authorization;
using Microsoft.Extensions.DependencyInjection;

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

        [HttpGet("revert-topbar")]
        [AllowAnonymous]
        public async Task<IActionResult> RevertTopbar()
        {
            try
            {
                var process = new System.Diagnostics.Process();
                process.StartInfo.FileName = "git";
                process.StartInfo.Arguments = "checkout -- frontend/src/components/layout/topbar.tsx";
                process.StartInfo.WorkingDirectory = @"d:\anhnt\project\Edu_Workforce _Saas";
                process.StartInfo.RedirectStandardOutput = true;
                process.StartInfo.RedirectStandardError = true;
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.CreateNoWindow = true;
                process.Start();
                string output = await process.StandardOutput.ReadToEndAsync();
                string error = await process.StandardError.ReadToEndAsync();
                process.WaitForExit();
                return Ok(new { output, error, exitCode = process.ExitCode });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("debug-users-orgs")]
        [AllowAnonymous]
        public async Task<IActionResult> DebugUsersOrgs()
        {
            var unitOfWork = HttpContext.RequestServices.GetService<IUnitOfWork>();
            if (unitOfWork == null) return BadRequest("No UnitOfWork");

            var orgs = await unitOfWork.Repository<Organization>().FindAsync(o => true, ignoreQueryFilters: true);
            var users = await unitOfWork.Repository<User>().FindAsync(u => true, ignoreQueryFilters: true);

            var orgList = orgs.Select(o => new {
                o.Id,
                o.Name,
                o.Code,
                o.SubscriptionStatus,
                o.SubscriptionStart,
                o.SubscriptionEnd,
                o.CurrentPlanId
            }).ToList();

            var userList = users.Select(u => new {
                u.Id,
                u.Email,
                u.FullName,
                u.OrganizationId,
                Role = u.Role?.Code
            }).ToList();

            return Ok(new { orgs = orgList, users = userList });
        }

        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<ActionResult<List<SystemSettingResponseDto>>> GetPublicSettings()
        {
            return Ok(await _settingService.GetPublicSettingsAsync());
        }

        [HttpGet]
        [HasPermission("SystemSettings:Manage")]
        public async Task<ActionResult<List<SystemSettingResponseDto>>> GetAllSettings()
        {
            return Ok(await _settingService.GetAllSettingsAsync());
        }

        [HttpPut("{key}")]
        [HasPermission("SystemSettings:Manage")]
        public async Task<IActionResult> UpdateSetting(string key, [FromBody] SystemSettingUpdateRequestDto request)
        {
            await _settingService.UpdateSettingAsync(key, request);
            return NoContent();
        }

        [HttpGet("audit-logs")]
        [HasPermission("SystemSettings:Manage")]
        public async Task<ActionResult<List<AuditLogResponseDto>>> GetAuditLogs()
        {
            return Ok(await _settingService.GetAuditLogsAsync());
        }
    }
}
