using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.User;
using EduOps.Application.DTOs.User.Requests;
using EduOps.Application.DTOs.User.Responses;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduOps.Api.Filters;
using EduOps.Api.Authorization;

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
        public async Task<IActionResult> GetUsers([FromQuery] GetUserListQueryDto query)
        {
            query.PageNumber = query.PageNumber < 1 ? 1 : query.PageNumber;
            query.PageSize = query.PageSize < 1 ? 20 : (query.PageSize > 100 ? 100 : query.PageSize);

            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userOrgId = GetOrganizationId();

            var targetOrgId = role == "SUPER_ADMIN" ? query.FilterOrgId : userOrgId;

            var result = await _userService.GetUsersAsync(targetOrgId, query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var result = await _userService.GetUserByIdAsync(id);
            return Ok(result);
        }

        [HttpPost]
        [HasPermission("Users:CREATE")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto request)
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var orgId = GetOrganizationId();

            var targetOrgId = role == "SUPER_ADMIN" ? request.OrganizationId : orgId;

            var result = await _userService.CreateUserAsync(request, targetOrgId);
            return CreatedAtAction(nameof(GetUser), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [HasPermission("Users:UPDATE")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequestDto request)
        {
            await _userService.UpdateUserAsync(id, request);
            return NoContent();
        }

        [HttpPost("{id}/deactivate")]
        [HasPermission("Users:UPDATE")]
        public async Task<IActionResult> DeactivateUser(Guid id)
        {
            await _userService.DeactivateUserAsync(id);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [HasPermission("Users:DELETE")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            await _userService.DeleteUserAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/lock")]
        [HasPermission("Users:UPDATE")]
        public async Task<IActionResult> LockUser(Guid id, [FromBody] LockUserRequestDto request)
        {
            await _userService.LockUserAsync(id, request.LockEndAt);
            return NoContent();
        }

        [HttpPost("{id}/unlock")]
        [HasPermission("Users:UPDATE")]
        public async Task<IActionResult> UnlockUser(Guid id)
        {
            await _userService.UnlockUserAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/reset-password")]
        [HasPermission("Users:UPDATE")]
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
