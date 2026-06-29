using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Attendance;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduOps.Api.Authorization;
using EduOps.Api.Filters;

namespace EduOps.Api.Controllers
{
    [Route("api/attendances")]
    [ApiController]
    [HasPermission("Attendances:Manage")]
    [RequirePaidSubscription]
    [FeatureGate("ENABLE_ATTENDANCE")]
    public class AttendancesController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;
        private readonly ICurrentUserService _currentUserService;

        public AttendancesController(IAttendanceService attendanceService, ICurrentUserService currentUserService)
        {
            _attendanceService = attendanceService;
            _currentUserService = currentUserService;
        }

        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] AttendanceRequestDto request)
        {
            var result = await _attendanceService.CheckInAsync(_currentUserService.UserId, request);
            return Ok(result);
        }

        [HttpPost("check-out")]
        public async Task<IActionResult> CheckOut([FromBody] AttendanceRequestDto request)
        {
            var result = await _attendanceService.CheckOutAsync(_currentUserService.UserId, request);
            return Ok(result);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyAttendances([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            var userId = _currentUserService.UserId;
            var result = await _attendanceService.GetMyAttendancesAsync(userId, pageNumber, pageSize);
            return Ok(result);
        }

        [HttpGet("today")]
        [HasPermission("Attendances:Manage")]
        public async Task<IActionResult> GetTodayAttendances()
        {
            var orgId = _currentUserService.OrganizationId ?? Guid.Empty;
            var result = await _attendanceService.GetTodayAttendancesAsync(orgId);
            return Ok(result);
        }

        [HttpPost("sessions/{sessionId}/students")]
        [HasPermission("Attendances:Manage")]
        public async Task<IActionResult> SubmitStudentAttendances(Guid sessionId, [FromBody] StudentAttendanceSubmitDto request)
        {
            var userId = _currentUserService.UserId;
            await _attendanceService.SubmitStudentAttendancesAsync(sessionId, _currentUserService.OrganizationId ?? Guid.Empty, userId, _currentUserService.Role, request);
            return Ok();
        }
    }
}
