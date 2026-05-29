using EduOps.Application.DTOs.Auth;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class UserMappingExtensions
    {
        public static UserDto ToDto(this User user)
        {
            if (user == null) return null!;

            return new UserDto
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
