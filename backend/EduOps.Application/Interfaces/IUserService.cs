using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Auth;
using EduOps.Application.DTOs.User;

namespace EduOps.Application.Interfaces
{
    public interface IUserService
    {
        Task<PagedResult<UserDto>> GetUsersAsync(Guid? organizationId, int pageNumber, int pageSize, string? searchKeyword = null);
        Task<UserDto> GetUserByIdAsync(Guid id);
        Task<UserDto> CreateUserAsync(CreateUserRequestDto request, Guid? organizationId);
        Task UpdateUserAsync(Guid id, UpdateUserRequestDto request);
        Task DeactivateUserAsync(Guid id);
        Task DeleteUserAsync(Guid id);
        Task LockUserAsync(Guid id, DateTime? lockEndAt);
        Task UnlockUserAsync(Guid id);
        Task ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request);
        Task ResetPasswordAsync(Guid? adminOrgId, Guid targetUserId, string newPassword);
    }
}
