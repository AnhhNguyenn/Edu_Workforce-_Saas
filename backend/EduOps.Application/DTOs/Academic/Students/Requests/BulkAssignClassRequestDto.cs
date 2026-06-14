using System;
using System.Collections.Generic;

namespace EduOps.Application.DTOs.Academic.Students.Requests
{
    public class BulkAssignClassRequestDto
    {
        public List<Guid> StudentIds { get; set; } = new List<Guid>();
        public Guid ClassId { get; set; }
    }
}
