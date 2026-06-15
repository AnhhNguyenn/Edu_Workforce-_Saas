using System;
using System.Collections.Generic;

using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class Organization : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        
        public string? CustomAppName { get; set; }
        public string? CustomLogoUrl { get; set; }
        public string? CustomDomain { get; set; }

        public virtual OrganizationDetail? OrganizationDetail { get; set; }

        public Guid? CurrentPlanId { get; set; }
        public virtual SubscriptionPlan? CurrentPlan { get; set; }

        public Guid? StatusId { get; set; }
        public virtual AccountStatus? Status { get; set; }
        // Trạng thái Gói cước: TRIAL, ACTIVE, EXPIRED, LOCKED
        public string SubscriptionStatus { get; set; } = "LOCKED";

        public DateTime? SubscriptionStart { get; set; }
        public DateTime? SubscriptionEnd { get; set; }

        public int? CustomTrialMaxUsers { get; set; }

        public virtual ICollection<School> Schools { get; set; } = new List<School>();
        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}
