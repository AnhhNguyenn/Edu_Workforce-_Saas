using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Auth.Requests;
using EduOps.Application.DTOs.Auth.Responses;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly string[] _systemRoles = { "SUPER_ADMIN", "CENTER_ADMIN", "TEACHER", "ASSISTANT" };

        public RoleService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<PermissionResponseDto>> GetAllPermissionsAsync()
        {
            var permissions = await _unitOfWork.Repository<Permission>().GetAllAsync(asNoTracking: true);
            return permissions.Select(p => new PermissionResponseDto
            {
                Id = p.Id,
                Module = p.Module,
                Action = p.Action,
                Description = p.Description
            }).OrderBy(p => p.Module).ThenBy(p => p.Action).ToList();
        }

        public async Task<IEnumerable<RoleResponseDto>> GetRolesAsync(Guid? organizationId)
        {
            var repo = _unitOfWork.Repository<Role>();
            var roles = await repo.FindAsync(
                r => r.DeletedAt == null && (r.OrganizationId == organizationId || r.OrganizationId == null),
                asNoTracking: true,
                includeProperties: "RolePermissions,RolePermissions.Permission"
            );

            return roles.Select(MapToDto).OrderByDescending(r => r.IsSystemRole).ThenBy(r => r.Name).ToList();
        }

        public async Task<RoleResponseDto> GetRoleByIdAsync(Guid id, Guid? organizationId)
        {
            var role = await _unitOfWork.Repository<Role>().FirstOrDefaultAsync(
                r => r.Id == id && r.DeletedAt == null,
                asNoTracking: true,
                includeProperties: "RolePermissions,RolePermissions.Permission"
            );

            if (role == null) throw new NotFoundException("Role", id);

            if (role.OrganizationId != null && role.OrganizationId != organizationId)
                throw new UnauthorizedAccessException("Bạn không có quyền xem chức vụ này.");

            return MapToDto(role);
        }

        public async Task<RoleResponseDto> CreateRoleAsync(CreateRoleRequestDto request, Guid? organizationId)
        {
            var repo = _unitOfWork.Repository<Role>();

            // Check duplicate name within the same org or system wide
            var exists = await repo.AnyAsync(r => r.Name.ToLower() == request.Name.ToLower() && (r.OrganizationId == organizationId || r.OrganizationId == null));
            if (exists) throw new BadRequestException($"Đã tồn tại Role với tên '{request.Name}'.");

            var newRole = new Role
            {
                Name = request.Name,
                Code = $"CUSTOM_{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                Description = request.Description,
                OrganizationId = organizationId
            };

            await repo.AddAsync(newRole);

            if (request.PermissionIds != null && request.PermissionIds.Any())
            {
                var rolePermissions = request.PermissionIds.Select(pId => new RolePermission
                {
                    RoleId = newRole.Id,
                    PermissionId = pId
                });
                await _unitOfWork.Repository<RolePermission>().AddRangeAsync(rolePermissions);
            }

            await _unitOfWork.CommitAsync();

            // Fetch to return with permissions
            return await GetRoleByIdAsync(newRole.Id, organizationId);
        }

        public async Task UpdateRoleAsync(Guid id, UpdateRoleRequestDto request, Guid? organizationId)
        {
            var repo = _unitOfWork.Repository<Role>();
            var role = await repo.FirstOrDefaultAsync(
                r => r.Id == id && r.DeletedAt == null,
                includeProperties: "RolePermissions"
            );

            if (role == null) throw new NotFoundException("Role", id);

            if (role.OrganizationId != null && role.OrganizationId != organizationId)
                throw new UnauthorizedAccessException("Bạn không có quyền sửa chức vụ này.");

            // Allow changing permissions for system roles, but NOT the name or code
            if (!_systemRoles.Contains(role.Code))
            {
                var exists = await repo.AnyAsync(r => r.Id != id && r.Name.ToLower() == request.Name.ToLower() && (r.OrganizationId == organizationId || r.OrganizationId == null));
                if (exists) throw new BadRequestException($"Đã tồn tại Role với tên '{request.Name}'.");

                role.Name = request.Name;
                role.Description = request.Description;
            }

            // Update permissions
            if (request.PermissionIds != null)
            {
                // Remove old
                _unitOfWork.Repository<RolePermission>().RemoveRange(role.RolePermissions);
                
                // Add new
                var newPermissions = request.PermissionIds.Select(pId => new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = pId
                });
                await _unitOfWork.Repository<RolePermission>().AddRangeAsync(newPermissions);
            }

            repo.Update(role);
            await _unitOfWork.CommitAsync();
        }

        public async Task DeleteRoleAsync(Guid id, Guid? organizationId)
        {
            var repo = _unitOfWork.Repository<Role>();
            var role = await repo.GetByIdAsync(id);

            if (role == null || role.DeletedAt != null) throw new NotFoundException("Role", id);

            if (_systemRoles.Contains(role.Code))
                throw new BadRequestException("Không thể xóa các Role cốt lõi của hệ thống.");

            if (role.OrganizationId != null && role.OrganizationId != organizationId)
                throw new UnauthorizedAccessException("Bạn không có quyền xóa chức vụ này.");

            var usersRepo = _unitOfWork.Repository<User>();
            var userCount = await usersRepo.CountAsync(u => u.RoleId == id && u.DeletedAt == null);
            if (userCount > 0)
                throw new BadRequestException($"Không thể xóa Role đang có {userCount} người dùng sử dụng. Hãy chuyển Role cho họ trước.");

            role.DeletedAt = DateTime.UtcNow;
            repo.Update(role);
            await _unitOfWork.CommitAsync();
        }

        private RoleResponseDto MapToDto(Role role)
        {
            return new RoleResponseDto
            {
                Id = role.Id,
                Name = role.Name,
                Code = role.Code,
                Description = role.Description,
                OrganizationId = role.OrganizationId,
                IsSystemRole = _systemRoles.Contains(role.Code),
                CreatedAt = role.CreatedAt,
                UpdatedAt = role.UpdatedAt,
                Permissions = role.RolePermissions?.Where(rp => rp.Permission != null).Select(rp => new PermissionResponseDto
                {
                    Id = rp.Permission!.Id,
                    Module = rp.Permission.Module,
                    Action = rp.Permission.Action,
                    Description = rp.Permission.Description
                }).ToList() ?? new List<PermissionResponseDto>()
            };
        }
    }
}
