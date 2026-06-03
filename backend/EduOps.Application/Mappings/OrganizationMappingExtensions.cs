using EduOps.Application.DTOs.Organization.Responses;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class OrganizationMappingExtensions
    {
        public static OrganizationListResponseDto ToListResponseDto(this Organization org, int maxUsers, int currentUsers)
        {
            if (org == null) return null!;

            return new OrganizationListResponseDto
            {
                Id = org.Id,
                Name = org.Name,
                Code = org.Code,
                MaxUsers = maxUsers,
                CurrentUsers = currentUsers,
                StatusId = org.StatusId,
                StatusCode = org.Status?.Code ?? string.Empty,
                SubscriptionStatus = org.SubscriptionStatus
            };
        }

        public static OrganizationDetailResponseDto ToDetailResponseDto(this Organization org, int maxUsers, int currentUsers)
        {
            if (org == null) return null!;

            return new OrganizationDetailResponseDto
            {
                Id = org.Id,
                Name = org.Name,
                Code = org.Code,
                Email = org.OrganizationDetail?.Email ?? string.Empty,
                Phone = org.OrganizationDetail?.Phone ?? string.Empty,
                Address = org.OrganizationDetail?.Address,
                MaxUsers = maxUsers,
                CurrentUsers = currentUsers,
                StatusId = org.StatusId,
                StatusCode = org.Status?.Code ?? string.Empty,
                SubscriptionStatus = org.SubscriptionStatus,
                SubscriptionStart = org.SubscriptionStart,
                SubscriptionEnd = org.SubscriptionEnd,
                CustomTrialMaxUsers = org.CustomTrialMaxUsers
            };
        }
    }
}
