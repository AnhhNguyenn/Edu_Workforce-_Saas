using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic.ClassSchedules.Requests;
using EduOps.Application.Interfaces;
using EduOps.Api.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduOps.Api.Authorization;

namespace EduOps.Api.Controllers
{
    [Route("api/classes/{classId}")]
    [ApiController]
    [HasPermission("Schedules:Manage")]
    [RequirePaidSubscription]
    public class ClassSchedulesController : ControllerBase
    {
        private readonly IClassScheduleService _scheduleService;

        public ClassSchedulesController(IClassScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        private Guid GetOrganizationId()
        {
            var claim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(claim)) return Guid.Empty;
            return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
        }

        [HttpPost("schedules")]
        public async Task<IActionResult> AddSchedule(Guid classId, [FromBody] AddClassScheduleRequestDto request)
        {
            await _scheduleService.AddScheduleAsync(classId, GetOrganizationId(), request);
            return Ok();
        }

        [HttpPost("enrollments")]
        public async Task<IActionResult> EnrollStudent(Guid classId, [FromBody] EnrollStudentRequestDto request)
        {
            await _scheduleService.EnrollStudentAsync(classId, GetOrganizationId(), request);
            return Ok();
        }

        [HttpPost("generate-sessions")]
        public async Task<IActionResult> GenerateSessions(Guid classId, [FromBody] GenerateSessionsRequestDto request)
        {
            await _scheduleService.GenerateSessionsAsync(classId, GetOrganizationId(), request);
            return Ok();
        }
    }
}
