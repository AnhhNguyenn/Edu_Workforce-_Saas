using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Auth;
using EduOps.Application.DTOs.User;

namespace EduOps.Application.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetUsersAsync(Guid? organizationId);
        Task<UserDto> GetUserByIdAsync(Guid id);
        Task<UserDto> CreateUserAsync(UserRequestDto request, Guid? organizationId);
        Task UpdateUserAsync(Guid id, UserRequestDto request);
        Task DeactivateUserAsync(Guid id);
    }
}
