using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Organization.Requests;
using EduOps.Application.DTOs.Organization.Responses;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduOps.Api.Authorization;

namespace EduOps.Api.Controllers
{
    [Route("api/organizations")]
    [ApiController]
    public class OrganizationsController : ControllerBase
    {
        private readonly IOrganizationService _orgService;
        private readonly EduOps.Domain.Interfaces.IUnitOfWork _unitOfWork;

        public OrganizationsController(IOrganizationService orgService, EduOps.Domain.Interfaces.IUnitOfWork unitOfWork)
        {
            _orgService = orgService;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        [HasPermission("Organizations:Manage")]
        public async Task<IActionResult> GetOrganizations([FromQuery] GetOrganizationListQueryDto query)
        {
            var result = await _orgService.GetOrganizationsAsync(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission("Organizations:Manage")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _orgService.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpPost]
        [HasPermission("Organizations:Manage")]
        public async Task<IActionResult> Create([FromBody] CreateOrganizationRequestDto request)
        {
            var result = await _orgService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [HasPermission("Organizations:Manage")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOrganizationRequestDto request)
        {
            await _orgService.UpdateAsync(id, request);
            return NoContent();
        }

        [HttpPut("{id}/subscription")]
        [HasPermission("Organizations:Manage")]
        public async Task<IActionResult> UpdateSubscription(Guid id, [FromBody] UpdateOrganizationSubscriptionRequestDto request)
        {
            await _orgService.UpdateSubscriptionAsync(id, request);
            return NoContent();
        }

        [HttpPost("{id}/suspend")]
        [HasPermission("Organizations:Manage")]
        public async Task<IActionResult> Suspend(Guid id)
        {
            await _orgService.SuspendAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/activate")]
        [HasPermission("Organizations:Manage")]
        public async Task<IActionResult> Activate(Guid id)
        {
            await _orgService.ActivateAsync(id);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [HasPermission("Organizations:Manage")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _orgService.DeleteAsync(id);
            return NoContent();
        }

        [HttpGet("{id}/stats")]
        [HasPermission("Organizations:Manage")]
        public async Task<IActionResult> GetStats(Guid id)
        {
            var userRepo = _unitOfWork.Repository<EduOps.Domain.Entities.User>();
            var sessionRepo = _unitOfWork.Repository<EduOps.Domain.Entities.Session>();

            // 1. Teachers Count
            var teachersCount = await userRepo.CountAsync(u => u.OrganizationId == id && u.Role != null && u.Role.Code == "TEACHER");

            // 2. Sessions Per Month
            var now = DateTime.UtcNow;
            var currentMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var sessionsCount = await sessionRepo.CountAsync(s => s.OrganizationId == id && s.SessionDate >= currentMonthStart);

            // 3. Attendance Rate (Simplified: Just mock 0% if no data, otherwise simple calc or just 0 for now)
            var attendanceRepo = _unitOfWork.Repository<EduOps.Domain.Entities.StudentSessionAttendance>();
            var totalAttendances = await attendanceRepo.CountAsync(a => a.OrganizationId == id && a.CreatedAt >= currentMonthStart);
            var presentCount = await attendanceRepo.CountAsync(a => a.OrganizationId == id && a.CreatedAt >= currentMonthStart && a.IsPresent);

            int attendanceRate = totalAttendances > 0 ? (int)Math.Round((double)presentCount / totalAttendances * 100) : 0;

            return Ok(new
            {
                Teachers = teachersCount,
                SessionsPerMonth = sessionsCount,
                AttendanceRate = attendanceRate
            });
        }

        [HttpGet("branding")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBrandingByDomain([FromQuery] string domain)
        {
            if (string.IsNullOrEmpty(domain)) return BadRequest("Domain is required");
            var result = await _orgService.GetBrandingByDomainAsync(domain);
            if (result == null) return NotFound();
            return Ok(result);
        }
    }
}