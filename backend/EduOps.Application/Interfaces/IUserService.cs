using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.User;
using EduOps.Application.DTOs.User.Requests;
using EduOps.Application.DTOs.User.Responses;

namespace EduOps.Application.Interfaces
{
    public interface IUserService
    {
        Task<PagedResult<UserListResponseDto>> GetUsersAsync(Guid? organizationId, GetUserListQueryDto query);
        Task<UserDetailResponseDto> GetUserByIdAsync(Guid id);
        Task<UserDetailResponseDto> CreateUserAsync(CreateUserRequestDto request, Guid? organizationId);
        Task UpdateUserAsync(Guid id, UpdateUserRequestDto request);
        Task DeactivateUserAsync(Guid id);
        Task DeleteUserAsync(Guid id);
        Task LockUserAsync(Guid id, DateTime? lockEndAt);
        Task UnlockUserAsync(Guid id);
        Task ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request);
        Task ResetPasswordAsync(Guid? adminOrgId, Guid targetUserId, string newPassword);
    }
}
