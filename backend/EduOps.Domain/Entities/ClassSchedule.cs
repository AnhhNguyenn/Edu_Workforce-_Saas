using System;
using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class ClassSchedule : TenantEntity
    {
        public Guid ClassId { get; set; }
        
        // 1=Monday, 2=Tuesday, etc.
        public int DayOfWeek { get; set; }
        
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        
        public Guid TeacherId { get; set; }
        public Guid? AssistantId { get; set; }
        
        // ACTIVE, INACTIVE
        public AccountStatus Status { get; set; } = AccountStatus.ACTIVE;
    }
}
