using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Auth;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace EduOps.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICustomLogger _logger;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthService(IUnitOfWork unitOfWork, ICustomLogger logger, IConfiguration configuration, IEmailService emailService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _configuration = configuration;
            _emailService = emailService;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            _logger.LogInformation($"Attempting login for user: {request.Email}");

            var userRepository = _unitOfWork.Repository<User>();
            
            request.Email = request.Email.ToLower();
            var user = await userRepository.FirstOrDefaultAsync(u => u.Email == request.Email, ignoreQueryFilters: true);

            bool isPasswordValid = false;
            if (user != null)
            {
                isPasswordValid = await Task.Run(() => BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash));
            }
            else
            {
                // Dummy hash to prevent Timing Attack (User Enumeration)
                await Task.Run(() => BCrypt.Net.BCrypt.HashPassword(request.Password, 11));
            }

            if (user == null || !isPasswordValid)
            {
                _logger.LogWarning($"Login failed: Invalid credentials for user {request.Email}");
                throw new System.UnauthorizedAccessException("Email hoặc mật khẩu không chính xác.");
            }

            if (user.DeletedAt != null)
                throw new System.UnauthorizedAccessException("Tài khoản không tồn tại hoặc đã bị xóa.");
            
            if (user.Status == "INACTIVE")
                throw new BadRequestException("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");

            // Auto-Unlock nếu đã hết thời gian khóa
            if (user.Status == "SUSPENDED" && user.LockEndAt.HasValue && user.LockEndAt.Value <= DateTime.UtcNow)
            {
                user.Status = "ACTIVE";
                user.LockEndAt = null;
            }
            else if (user.Status == "SUSPENDED" || (user.LockEndAt.HasValue && user.LockEndAt.Value > DateTime.UtcNow))
            {
                var lockMessage = user.LockEndAt == DateTime.MaxValue 
                    ? "Tài khoản của bạn đã bị khóa vĩnh viễn." 
                    : (user.LockEndAt.HasValue ? $"Tài khoản của bạn bị khóa đến {user.LockEndAt:dd/MM/yyyy HH:mm}." : "Tài khoản của bạn đã bị khóa.");
                throw new BadRequestException(lockMessage); 
            }

            var userDto = user.ToDto();

            var accessToken = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();
            
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            user.LastLoginAt = DateTime.UtcNow;
            
            userRepository.Update(user);
            await _unitOfWork.CommitAsync();

            return new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = userDto
            };
        }

        public async Task<LoginResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request)
        {
            var principal = GetPrincipalFromExpiredToken(request.AccessToken);
            if (principal == null)
            {
                throw new BadRequestException("Invalid access token or refresh token");
            }

            var userIdString = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!Guid.TryParse(userIdString, out Guid userId))
            {
                throw new BadRequestException("Invalid token payload");
            }

            var userRepository = _unitOfWork.Repository<User>();
            var user = await userRepository.FirstOrDefaultAsync(u => u.Id == userId, ignoreQueryFilters: true);

            if (user == null || user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                throw new BadRequestException("Invalid or expired refresh token");
            }

            if (user.DeletedAt != null)
                throw new System.UnauthorizedAccessException("Tài khoản không tồn tại hoặc đã bị xóa.");
            
            if (user.Status == "INACTIVE")
                throw new BadRequestException("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");

            // Auto-Unlock nếu đã hết thời gian khóa
            if (user.Status == "SUSPENDED" && user.LockEndAt.HasValue && user.LockEndAt.Value <= DateTime.UtcNow)
            {
                user.Status = "ACTIVE";
                user.LockEndAt = null;
            }
            else if (user.Status == "SUSPENDED" || (user.LockEndAt.HasValue && user.LockEndAt.Value > DateTime.UtcNow))
            {
                var lockMessage = user.LockEndAt == DateTime.MaxValue 
                    ? "Tài khoản của bạn đã bị khóa vĩnh viễn." 
                    : (user.LockEndAt.HasValue ? $"Tài khoản của bạn bị khóa đến {user.LockEndAt:dd/MM/yyyy HH:mm}." : "Tài khoản của bạn đã bị khóa.");
                throw new BadRequestException(lockMessage); 
            }

            var newAccessToken = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            userRepository.Update(user);
            await _unitOfWork.CommitAsync();

            return new LoginResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                User = user.ToDto()
            };
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("OrganizationId", user.OrganizationId?.ToString() ?? string.Empty)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["AccessTokenExpirationMinutes"]!)),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = System.Security.Cryptography.RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(randomNumber);
        }

        private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateLifetime = false // Here we are saying that we don't care about the token's expiration date
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
            if (securityToken is not JwtSecurityToken jwtSecurityToken || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");

            return principal;
        }

        public async Task LogoutAsync(Guid userId)
        {
            var userRepository = _unitOfWork.Repository<User>();
            var user = await userRepository.GetByIdAsync(userId);
            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                userRepository.Update(user);
                await _unitOfWork.CommitAsync();
            }
        }

        public async Task ForgotPasswordAsync(ForgotPasswordRequestDto request)
        {
            var userRepository = _unitOfWork.Repository<User>();
            request.Email = request.Email.ToLower();
            var user = await userRepository.FirstOrDefaultAsync(u => u.Email == request.Email, ignoreQueryFilters: true);

            if (user == null || user.DeletedAt != null)
            {
                // We should not reveal that the user does not exist for security reasons,
                // but for this implementation we can just return or throw BadRequest.
                // Let's just return to simulate email sent.
                return;
            }

            // Generate cryptographically secure 6-digit OTP
            var otp = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            
            user.ResetPasswordToken = otp;
            user.ResetPasswordTokenExpiryTime = DateTime.UtcNow.AddMinutes(15);
            
            userRepository.Update(user);
            await _unitOfWork.CommitAsync();

            var emailBody = $"Mã xác nhận (OTP) để khôi phục mật khẩu của bạn là: {otp}\nMã này có hiệu lực trong 15 phút.";
            await _emailService.SendEmailAsync(user.Email, "Khôi phục mật khẩu", emailBody);
        }

        public async Task ResetPasswordViaTokenAsync(ResetPasswordViaTokenRequestDto request)
        {
            var userRepository = _unitOfWork.Repository<User>();
            var user = await userRepository.FirstOrDefaultAsync(u => u.ResetPasswordToken == request.Token && u.ResetPasswordTokenExpiryTime > DateTime.UtcNow, ignoreQueryFilters: true);

            if (user == null || user.DeletedAt != null)
                throw new BadRequestException("Mã xác nhận không hợp lệ hoặc đã hết hạn.");

            user.PasswordHash = await Task.Run(() => BCrypt.Net.BCrypt.HashPassword(request.NewPassword));
            user.ResetPasswordToken = null;
            user.ResetPasswordTokenExpiryTime = null;
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;

            userRepository.Update(user);
            await _unitOfWork.CommitAsync();
        }
    }
}
