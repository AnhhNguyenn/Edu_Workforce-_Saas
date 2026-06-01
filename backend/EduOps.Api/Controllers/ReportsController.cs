using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduOps.Application.DTOs.Report;
using EduOps.Application.Interfaces;

namespace EduOps.Api.Controllers
{
    [Route("api/reports")]
    [ApiController]
    [Authorize(Roles = "TEACHER,ASSISTANT,CENTER_ADMIN")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly ICurrentUserService _currentUserService;

        public ReportsController(IReportService reportService, ICurrentUserService currentUserService)
        {
            _reportService = reportService;
            _currentUserService = currentUserService;
        }

        [HttpGet("session/{sessionId}")]
        public async Task<IActionResult> GetBySession(Guid sessionId)
        {
            var orgIdClaim = User.FindFirst("OrganizationId")?.Value;
            var orgId = Guid.TryParse(orgIdClaim, out var id) ? id : Guid.Empty;
            
            var result = await _reportService.GetReportBySessionIdAsync(sessionId, orgId, _currentUserService.UserId, _currentUserService.Role);
            return Ok(result);
        }

        [HttpPost("session/{sessionId}/teacher")]
        public async Task<IActionResult> SubmitTeacherReport(Guid sessionId, [FromBody] TeacherReportRequestDto request)
        {
            var result = await _reportService.SubmitTeacherReportAsync(sessionId, _currentUserService.UserId, request);
            return Ok(result);
        }

        [HttpPost("session/{sessionId}/assistant")]
        public async Task<IActionResult> SubmitAssistantReport(Guid sessionId, [FromBody] AssistantReportRequestDto request)
        {
            var result = await _reportService.SubmitAssistantReportAsync(sessionId, _currentUserService.UserId, request);
            return Ok(result);
        }

        [HttpPost("{reportId}/media")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadMedia(Guid reportId, IFormFile file)
        {
            var result = await _reportService.UploadReportMediaAsync(reportId, _currentUserService.UserId, _currentUserService.Role, file);
            return Ok(result);
        }
    }
}
