using System;
using EduOps.Domain.Enums;

namespace EduOps.Application.DTOs.Organization.Responses
{
    public class OrganizationListResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int MaxUsers { get; set; }
        public int CurrentUsers { get; set; }
        public Guid? StatusId { get; set; }
        public string StatusCode { get; set; } = string.Empty;
        public string SubscriptionStatus { get; set; } = string.Empty;
    }
}
