using System;
using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class Student : TenantEntity
    {
        public string FullName { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        public DateTime? BirthDate { get; set; }
        public string ParentName { get; set; } = string.Empty;
        public string ParentPhone { get; set; } = string.Empty;
        public string ParentEmail { get; set; } = string.Empty;
        
        // ACTIVE, SUSPENDED, DROPPED_OUT
        public AccountStatus Status { get; set; } = AccountStatus.ACTIVE;
    }
}
