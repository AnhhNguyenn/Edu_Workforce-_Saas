using System;

namespace EduOps.Application.DTOs.Organization.Requests
{
    public class CreateOrganizationRequestDto
    {
        public string Name { get; set; } = string.Empty;

        public string Code { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string? Address { get; set; }

        public Guid PlanId { get; set; }

        public bool SkipTrial { get; set; } = false;

        public int? CustomTrialMaxUsers { get; set; }
    }
}
