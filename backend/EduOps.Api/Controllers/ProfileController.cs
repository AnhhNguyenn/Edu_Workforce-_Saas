using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.User.Requests;
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
        private readonly ICurrentUserService _currentUserService;

        public ProfileController(IProfileService profileService, IUserService userService, ICurrentUserService currentUserService)
        {
            _profileService = profileService;
            _userService = userService;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = _currentUserService.UserId;
            if (userId == Guid.Empty)
                return Unauthorized();

            var result = await _profileService.GetProfileAsync(userId);
            return Ok(result);
        }

        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Invalid file");

            var userId = _currentUserService.UserId;
            if (userId == Guid.Empty)
                return Unauthorized();

            using var stream = file.OpenReadStream();
            var avatarUrl = await _profileService.UploadAvatarAsync(userId, stream, file.FileName, file.ContentType);

            return Ok(new { AvatarUrl = avatarUrl });
        }

        [HttpPost("organization/logo")]
        public async Task<IActionResult> UploadOrganizationLogo(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Invalid file");

            var userId = _currentUserService.UserId;
            if (userId == Guid.Empty)
                return Unauthorized();

            using var stream = file.OpenReadStream();
            var logoUrl = await _profileService.UploadOrganizationLogoAsync(userId, stream, file.FileName, file.ContentType);

            return Ok(new { LogoUrl = logoUrl });
        }

        [HttpPost("password")]
        public async Task<IActionResult> ChangePassword([FromBody] EduOps.Application.DTOs.User.ChangePasswordRequestDto request)
        {
            var userId = _currentUserService.UserId;
            if (userId == Guid.Empty)
                return Unauthorized();

            await _userService.ChangePasswordAsync(userId, request);
            return NoContent();
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request)
        {
            var userId = _currentUserService.UserId;
            if (userId == Guid.Empty)
                return Unauthorized();

            await _profileService.UpdateProfileAsync(userId, request);
            return NoContent();
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats([FromQuery] int? month, [FromQuery] int? year)
        {
            var userId = _currentUserService.UserId;
            if (userId == Guid.Empty)
                return Unauthorized();

            var result = await _profileService.GetStatsAsync(userId, month, year);
            return Ok(result);
        }
    }
}
