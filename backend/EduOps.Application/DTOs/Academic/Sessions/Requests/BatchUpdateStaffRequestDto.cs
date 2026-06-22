using System;
using System.Collections.Generic;

namespace EduOps.Application.DTOs.Academic.Sessions.Requests
{
    public class BatchUpdateStaffRequestDto
    {
        public List<Guid> SessionIds { get; set; } = new List<Guid>();
        public Guid? TeacherId { get; set; }
        public Guid? AssistantId { get; set; }
    }
}
