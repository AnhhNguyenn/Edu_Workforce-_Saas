using System;

namespace EduOps.Application.DTOs.Organization.Requests
{
    public class UpdateOrganizationSubscriptionRequestDto
    {
        public Guid? PlanId { get; set; }
        public string SubscriptionStatus { get; set; } = string.Empty;
        public DateTime? SubscriptionEnd { get; set; }
    }
}
