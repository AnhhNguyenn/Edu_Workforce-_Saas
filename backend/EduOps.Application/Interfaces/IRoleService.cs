using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Auth.Requests;
using EduOps.Application.DTOs.Auth.Responses;

namespace EduOps.Application.Interfaces
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleResponseDto>> GetRolesAsync(Guid? organizationId);
        Task<RoleResponseDto> GetRoleByIdAsync(Guid id, Guid? organizationId);
        Task<RoleResponseDto> CreateRoleAsync(CreateRoleRequestDto request, Guid? organizationId);
        Task UpdateRoleAsync(Guid id, UpdateRoleRequestDto request, Guid? organizationId);
        Task DeleteRoleAsync(Guid id, Guid? organizationId);
        Task<IEnumerable<PermissionResponseDto>> GetAllPermissionsAsync();
        Task AssignPermissionsToRoleAsync(Guid roleId, AssignPermissionsRequestDto request, Guid? organizationId);
    }
}
