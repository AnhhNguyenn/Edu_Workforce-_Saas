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
        public async Task<IActionResult> GetUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, [FromQuery] string? searchKeyword = null)
        {
            var orgId = GetOrganizationId();
            var result = await _userService.GetUsersAsync(orgId, pageNumber, pageSize, searchKeyword);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var result = await _userService.GetUserByIdAsync(id);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "SUPER_ADMIN,CENTER_ADMIN")]
        public async Task<IActionResult> CreateUser([FromBody] UserRequestDto request)
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var orgId = GetOrganizationId();

            // Nếu là SUPER_ADMIN, cho phép lấy OrgId từ body (để gán Admin cho một Trung tâm)
            // Nếu là CENTER_ADMIN, bắt buộc dùng orgId từ JWT Token của họ
            var targetOrgId = role == "SUPER_ADMIN" ? request.OrganizationId : orgId;

            var result = await _userService.CreateUserAsync(request, targetOrgId);
            return CreatedAtAction(nameof(GetUser), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UserRequestDto request)
        {
            await _userService.UpdateUserAsync(id, request);
            return NoContent();
        }

        [HttpPost("{id}/deactivate")]
        public async Task<IActionResult> DeactivateUser(Guid id)
        {
            await _userService.DeactivateUserAsync(id);
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            await _userService.DeleteUserAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/lock")]
        public async Task<IActionResult> LockUser(Guid id, [FromBody] LockUserRequest request)
        {
            await _userService.LockUserAsync(id, request.LockEndAt);
            return NoContent();
        }

        [HttpPost("{id}/unlock")]
        public async Task<IActionResult> UnlockUser(Guid id)
        {
            await _userService.UnlockUserAsync(id);
            return NoContent();
        }
    }

    public class LockUserRequest
    {
        public DateTime? LockEndAt { get; set; }
    }
}
