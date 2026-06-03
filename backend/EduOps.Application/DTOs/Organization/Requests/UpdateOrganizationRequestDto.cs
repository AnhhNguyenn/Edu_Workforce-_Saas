using System;

namespace EduOps.Application.DTOs.Organization.Requests
{
    public class UpdateOrganizationRequestDto
    {
        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string? Address { get; set; }

        public int? CustomTrialMaxUsers { get; set; }
    }
}
