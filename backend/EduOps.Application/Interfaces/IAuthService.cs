using System.Threading.Tasks;
using EduOps.Application.DTOs.Auth;

namespace EduOps.Application.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
        Task<LoginResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request);
        Task LogoutAsync(Guid userId);
    }
}
