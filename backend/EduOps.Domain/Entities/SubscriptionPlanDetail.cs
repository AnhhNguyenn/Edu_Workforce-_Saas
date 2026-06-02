using System;

namespace EduOps.Domain.Entities
{
    public class SubscriptionPlanDetail : BaseEntity
    {
        public Guid SubscriptionPlanId { get; set; }
        public virtual SubscriptionPlan? SubscriptionPlan { get; set; }

        public string? Description { get; set; }
    }
}
