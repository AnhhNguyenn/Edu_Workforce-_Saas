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

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Invalid file");

            // Lấy ID từ JWT (Mock)
            var userId = Guid.Empty;

            using var stream = file.OpenReadStream();
            var avatarUrl = await _profileService.UploadAvatarAsync(userId, stream, file.FileName, file.ContentType);
            
            return Ok(new { AvatarUrl = avatarUrl });
        }
    }
}
