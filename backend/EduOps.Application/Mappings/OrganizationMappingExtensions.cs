using EduOps.Application.DTOs.Organization;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class OrganizationMappingExtensions
    {
        public static OrganizationDto ToDto(this Organization org)
        {
            if (org == null) return null!;

            return new OrganizationDto
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
