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
                Role = user.Role,
                Status = Enum.Parse<EduOps.Domain.Enums.AccountStatus>(user.Status)
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
                Role = user.Role,
                AvatarUrl = user.AvatarUrl,
                Status = Enum.Parse<EduOps.Domain.Enums.AccountStatus>(user.Status),
                LastLoginAt = user.LastLoginAt,
                LockEndAt = user.LockEndAt
            };
        }
    }
}
