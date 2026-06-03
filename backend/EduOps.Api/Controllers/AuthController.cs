using System;
using System.Threading.Tasks;
using System.Linq;
using EduOps.Application.DTOs.Auth;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace EduOps.Api.Controllers
{
    [Route("api/auth")]
    [ApiController]
    [EnableRateLimiting("AuthLimit")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ICurrentUserService _currentUserService;

        public AuthController(IAuthService authService, ICurrentUserService currentUserService)
        {
            _authService = authService;
            _currentUserService = currentUserService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var result = await _authService.LoginAsync(request);
            return Ok(result);
        }

        [HttpPost("verify-2fa")]
        public async Task<IActionResult> Verify2FA([FromBody] Verify2FARequestDto request)
        {
            var result = await _authService.Verify2FAAsync(request);
            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            var result = await _authService.RefreshTokenAsync(request);
            return Ok(result);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var userId = _currentUserService.UserId;
            if (userId != Guid.Empty)
            {
                await _authService.LogoutAsync(userId);
            }
            return NoContent();
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
        {
            await _authService.ForgotPasswordAsync(request);
            return Ok(new { Message = "Nếu email hợp lệ, mã OTP sẽ được gửi đến hộp thư của bạn." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPasswordViaToken([FromBody] ResetPasswordViaTokenRequestDto request)
        {
            await _authService.ResetPasswordViaTokenAsync(request);
            return Ok(new { message = "Mật khẩu đã được khôi phục thành công." });
        }

        [HttpGet("debug-claims")]
        [Authorize]
        public IActionResult DebugClaims()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            return Ok(new {
                Message = "Đây là danh sách các quyền hiện tại đang có trong Token của bạn. Nếu không thấy 'role': 'SUPER_ADMIN' tức là bạn đang dùng Token cũ!",
                Claims = claims
            });
        }
    }
}
