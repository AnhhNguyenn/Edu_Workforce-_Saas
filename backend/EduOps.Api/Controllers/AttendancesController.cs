using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Attendance;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduOps.Api.Filters;

namespace EduOps.Api.Controllers
{
    [Route("api/attendances")]
    [ApiController]
    [Authorize(Roles = "TEACHER,CENTER_ADMIN")]
    [RequirePaidSubscription]
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

        [HttpPost("sessions/{sessionId}/students")]
        [Authorize(Roles = "TEACHER,ASSISTANT,CENTER_ADMIN")]
        public async Task<IActionResult> SubmitStudentAttendances(Guid sessionId, [FromBody] StudentAttendanceSubmitDto request)
        {
            var userId = _currentUserService.UserId;
            await _attendanceService.SubmitStudentAttendancesAsync(sessionId, _currentUserService.OrganizationId ?? Guid.Empty, userId, _currentUserService.Role, request);
            return Ok();
        }
    }
}
