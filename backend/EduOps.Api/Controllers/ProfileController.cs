using System;
using System.Threading.Tasks;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [Route("api/profile")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;
        private readonly IUserService _userService;

        public ProfileController(IProfileService profileService, IUserService userService)
        {
            _profileService = profileService;
            _userService = userService;
        }

        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Invalid file");

            // Lấy ID từ JWT
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
                return Unauthorized();

            using var stream = file.OpenReadStream();
            var avatarUrl = await _profileService.UploadAvatarAsync(userId, stream, file.FileName, file.ContentType);
            
            return Ok(new { AvatarUrl = avatarUrl });
        }

        [HttpPost("password")]
        public async Task<IActionResult> ChangePassword([FromBody] EduOps.Application.DTOs.User.ChangePasswordRequestDto request)
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
                return Unauthorized();

            await _userService.ChangePasswordAsync(userId, request);
            return NoContent();
        }
    }
}
