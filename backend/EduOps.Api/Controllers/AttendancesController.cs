using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Attendance;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [Route("api/attendances")]
    [ApiController]
    [Authorize(Roles = "TEACHER,CENTER_ADMIN")]
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

        [HttpGet("my-records")]
        public async Task<IActionResult> GetMyRecords([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _attendanceService.GetMyAttendancesAsync(_currentUserService.UserId, pageNumber, pageSize);
            return Ok(result);
        }
    }
}
