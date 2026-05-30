using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Auth;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [Route("api/auth")]
    [ApiController]
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

        [HttpPost("reset-password-via-token")]
        public async Task<IActionResult> ResetPasswordViaToken([FromBody] ResetPasswordViaTokenRequestDto request)
        {
            await _authService.ResetPasswordViaTokenAsync(request);
            return Ok(new { Message = "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." });
        }
    }
}
