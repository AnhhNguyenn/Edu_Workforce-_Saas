using EduOps.Application.DTOs.Organization.Responses;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class OrganizationMappingExtensions
    {
        public static OrganizationListResponseDto ToListResponseDto(this Organization org)
        {
            if (org == null) return null!;

            return new OrganizationListResponseDto
            {
                Id = org.Id,
                Name = org.Name,
                Code = org.Code,
                MaxUsers = org.MaxUsers,
                CurrentUsers = org.CurrentUsers,
                Status = org.Status
            };
        }

        public static OrganizationDetailResponseDto ToDetailResponseDto(this Organization org)
        {
            if (org == null) return null!;

            return new OrganizationDetailResponseDto
            {
                Id = org.Id,
                Name = org.Name,
                Code = org.Code,
                Email = org.Email,
                Phone = org.Phone,
                Address = org.Address,
                MaxUsers = org.MaxUsers,
                CurrentUsers = org.CurrentUsers,
                Status = org.Status,
                SubscriptionStart = org.SubscriptionStart,
                SubscriptionEnd = org.SubscriptionEnd
            };
        }
    }
}
