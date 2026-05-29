using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.User;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduOps.Api.Filters;

namespace EduOps.Api.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize]
    [RequirePaidSubscription]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        private Guid? GetOrganizationId()
        {
            var claim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(claim)) return null;
            return Guid.TryParse(claim, out var id) ? id : null;
        }

        [HttpGet]
        [Authorize(Roles = "SUPER_ADMIN,CENTER_ADMIN")]
        public async Task<IActionResult> GetUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, [FromQuery] string? searchKeyword = null, [FromQuery] Guid? filterOrgId = null)
        {
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            pageSize = pageSize < 1 ? 20 : (pageSize > 100 ? 100 : pageSize);
            
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userOrgId = GetOrganizationId();
            
            var targetOrgId = role == "SUPER_ADMIN" ? filterOrgId : userOrgId;
            
            var result = await _userService.GetUsersAsync(targetOrgId, pageNumber, pageSize, searchKeyword);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "SUPER_ADMIN,CENTER_ADMIN")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var result = await _userService.GetUserByIdAsync(id);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "SUPER_ADMIN,CENTER_ADMIN")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto request)
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var orgId = GetOrganizationId();

            var targetOrgId = role == "SUPER_ADMIN" ? request.OrganizationId : orgId;

            var result = await _userService.CreateUserAsync(request, targetOrgId);
            return CreatedAtAction(nameof(GetUser), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "SUPER_ADMIN,CENTER_ADMIN")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequestDto request)
        {
            await _userService.UpdateUserAsync(id, request);
            return NoContent();
        }

        [HttpPost("{id}/deactivate")]
        [Authorize(Roles = "SUPER_ADMIN,CENTER_ADMIN")]
        public async Task<IActionResult> DeactivateUser(Guid id)
        {
            await _userService.DeactivateUserAsync(id);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SUPER_ADMIN,CENTER_ADMIN")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            await _userService.DeleteUserAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/lock")]
        [Authorize(Roles = "SUPER_ADMIN,CENTER_ADMIN")]
        public async Task<IActionResult> LockUser(Guid id, [FromBody] LockUserRequestDto request)
        {
            await _userService.LockUserAsync(id, request.LockEndAt);
            return NoContent();
        }

        [HttpPost("{id}/unlock")]
        [Authorize(Roles = "SUPER_ADMIN,CENTER_ADMIN")]
        public async Task<IActionResult> UnlockUser(Guid id)
        {
            await _userService.UnlockUserAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/reset-password")]
        [Authorize(Roles = "SUPER_ADMIN,CENTER_ADMIN")]
        public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequestDto request)
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var orgId = GetOrganizationId();
            
            var adminOrgId = role == "SUPER_ADMIN" ? (Guid?)null : orgId;

            await _userService.ResetPasswordAsync(adminOrgId, id, request.NewPassword);
            return NoContent();
        }
    }
}
