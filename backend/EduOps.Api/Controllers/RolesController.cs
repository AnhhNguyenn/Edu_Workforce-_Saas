using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Auth.Requests;
using EduOps.Application.Interfaces;
using EduOps.Api.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [RequirePaidSubscription]
    public class RolesController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RolesController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        private Guid? GetOrganizationId()
        {
            var role = User.FindFirst("role")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "SUPER_ADMIN" && role != "CENTER_ADMIN")
            {
                throw new UnauthorizedAccessException($"Bạn không có quyền! Token của bạn đang có Role là: '{role ?? "RỖNG"}'. Hãy gọi API Login lại để lấy Token mới!");
            }

            if (role == "SUPER_ADMIN") return null;

            var claim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(claim)) return null;
            return Guid.TryParse(claim, out var id) ? id : null;
        }

        [HttpGet("permissions")]
        public async Task<IActionResult> GetAllPermissions()
        {
            var result = await _roleService.GetAllPermissionsAsync();
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var orgId = GetOrganizationId();
            var result = await _roleService.GetRolesAsync(orgId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRole(Guid id)
        {
            var orgId = GetOrganizationId();
            var result = await _roleService.GetRoleByIdAsync(id, orgId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequestDto request)
        {
            var orgId = GetOrganizationId();
            var result = await _roleService.CreateRoleAsync(request, orgId);
            return CreatedAtAction(nameof(GetRole), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequestDto request)
        {
            var orgId = GetOrganizationId();
            await _roleService.UpdateRoleAsync(id, request, orgId);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            var orgId = GetOrganizationId();
            await _roleService.DeleteRoleAsync(id, orgId);
            return NoContent();
        }

        [HttpPost("{id}/permissions")]
        [Authorize(Roles = "SUPER_ADMIN,CENTER_ADMIN")]
        public async Task<IActionResult> AssignPermissions(Guid id, [FromBody] AssignPermissionsRequestDto request)
        {
            var orgId = GetOrganizationId();
            await _roleService.AssignPermissionsToRoleAsync(id, request, orgId);
            return NoContent();
        }
    }
}
