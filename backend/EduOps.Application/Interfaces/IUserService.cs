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
        Task<UserDto> CreateUserAsync(UserRequestDto request, Guid? organizationId);
        Task UpdateUserAsync(Guid id, UserRequestDto request);
        Task DeactivateUserAsync(Guid id);
        Task DeleteUserAsync(Guid id);
        Task LockUserAsync(Guid id, DateTime? lockEndAt);
        Task UnlockUserAsync(Guid id);
    }
}
