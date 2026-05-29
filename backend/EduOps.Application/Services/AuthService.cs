using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
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

        public AuthService(IUnitOfWork unitOfWork, ICustomLogger logger, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            _logger.LogInformation($"Attempting login for user: {request.Email}");

            var userRepository = _unitOfWork.Repository<User>();
            
            var users = await userRepository.FindAsync(u => u.Email == request.Email);
            var user = users.FirstOrDefault();

            if (user == null)
            {
                throw new NotFoundException("User", request.Email);
            }

            if (user.Status != "ACTIVE" || (user.LockEndAt.HasValue && user.LockEndAt.Value > DateTime.UtcNow))
            {
                var lockMessage = user.LockEndAt == DateTime.MaxValue 
                    ? "Tài khoản của bạn đã bị khóa vĩnh viễn." 
                    : $"Tài khoản của bạn bị khóa đến {user.LockEndAt?.ToLocalTime():dd/MM/yyyy HH:mm}.";
                throw new Exception(lockMessage); // Use generic exception for simple error passing or a custom one
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                _logger.LogWarning($"Login failed: Invalid password for user {request.Email}");
                throw new System.UnauthorizedAccessException("Invalid credentials");
            }

            var userDto = user.ToDto();

            var accessToken = GenerateJwtToken(user);
            var refreshToken = Guid.NewGuid().ToString(); // Giả lập refresh token
            
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
    }
}
