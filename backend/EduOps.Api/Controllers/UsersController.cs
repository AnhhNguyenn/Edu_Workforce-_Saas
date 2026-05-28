using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.User;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            // TODO: Lấy OrganizationId từ JWT Token
            Guid? orgId = Guid.Empty; // Mock
            var result = await _userService.GetUsersAsync(orgId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var result = await _userService.GetUserByIdAsync(id);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UserRequestDto request)
        {
            Guid? orgId = Guid.Empty; // Mock
            var result = await _userService.CreateUserAsync(request, orgId);
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
    }
}
