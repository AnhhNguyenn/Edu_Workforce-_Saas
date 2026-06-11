using EduOps.Application.DTOs.User.Responses;
using EduOps.Domain.Entities;
using System;

namespace EduOps.Application.Mappings
{
    public static class UserMappingExtensions
    {
        public static UserListResponseDto ToListResponseDto(this User user)
        {
            if (user == null) return null!;

            return new UserListResponseDto
            {
                Id = user.Id,
                OrganizationId = user.OrganizationId,
                FullName = user.FullName,
                Email = user.Email,
                RoleId = user.RoleId,
                RoleCode = user.Role?.Code ?? string.Empty,
                StatusId = user.StatusId,
                StatusCode = user.Status?.Code ?? string.Empty,
                LastLoginAt = user.LastLoginAt,
                LockEndAt = user.LockEndAt
            };
        }

        public static UserDetailResponseDto ToDetailResponseDto(this User user)
        {
            if (user == null) return null!;

            return new UserDetailResponseDto
            {
                Id = user.Id,
                OrganizationId = user.OrganizationId,
                FullName = user.FullName,
                Email = user.Email,
                RoleId = user.RoleId,
                RoleCode = user.Role?.Code ?? string.Empty,
                AvatarUrl = user.UserDetail?.AvatarUrl,
                StatusId = user.StatusId,
                StatusCode = user.Status?.Code ?? string.Empty,
                LastLoginAt = user.LastLoginAt,
                LockEndAt = user.LockEndAt
            };
        }
    }
}
