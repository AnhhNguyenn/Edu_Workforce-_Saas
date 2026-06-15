using System;

namespace EduOps.Application.DTOs.Organization.Responses
{
    public class OrganizationBrandingDto
    {
        public Guid OrganizationId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public string? CustomAppName { get; set; }
        public string? CustomLogoUrl { get; set; }
    }
}
