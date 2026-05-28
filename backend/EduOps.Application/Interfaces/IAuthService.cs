using System.Threading.Tasks;
using EduOps.Application.DTOs.Auth;

namespace EduOps.Application.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
        // Task<LoginResponseDto> RefreshTokenAsync(string refreshToken);
        // Task ChangePasswordAsync(Guid userId, string oldPassword, string newPassword);
    }
}
