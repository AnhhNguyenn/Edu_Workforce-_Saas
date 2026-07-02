using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.SystemSettings.Responses;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [ApiController]
    [Route("api/audit-logs")]
    [Authorize]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentUserService _currentUserService;

        public AuditLogsController(IAuditLogService auditLogService, ICurrentUserService currentUserService)
        {
            _auditLogService = auditLogService;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<AuditLogResponseDto>>> GetTenantLogs(
            [FromQuery] string type = "audit", 
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 50,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? action = null,
            [FromQuery] string? keyword = null
        )
        {
            var orgId = _currentUserService.OrganizationId;
            var role = _currentUserService.Role;
            
            if (!orgId.HasValue || orgId.Value == Guid.Empty)
            {
                if (role != "SUPER_ADMIN")
                {
                    return StatusCode(403, "Chỉ dành cho Quản trị viên Trung tâm.");
                }
                return BadRequest("Tài khoản Super Admin cần chọn một Organization cụ thể để xem Audit Log.");
            }

            var result = await _auditLogService.GetTenantAuditLogsAsync(orgId.Value, pageNumber, pageSize, type, startDate, endDate, action, keyword);
            return Ok(result);
        }
    }
}
