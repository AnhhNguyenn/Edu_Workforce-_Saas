using System;

using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class Report : TenantEntity
    {
        public Guid SessionId { get; set; }
        public Guid TeacherId { get; set; }
        public Guid? AssistantId { get; set; }

        public int AttendanceCount { get; set; }
        public int AbsentCount { get; set; }

        public virtual ReportDetail? ReportDetail { get; set; }

        // DRAFT, SUBMITTED, FINALIZED
        public Guid? StatusId { get; set; }
        public virtual ReportStatus? Status { get; set; }

        public DateTime? SubmittedAt { get; set; }
        public DateTime? FinalizedAt { get; set; }
    }
}
