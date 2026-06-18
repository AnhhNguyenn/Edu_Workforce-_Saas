using System;

namespace EduOps.Application.DTOs.Academic.Sessions.Requests
{
    public class GetSessionListQueryDto
    {
        public Guid? ClassId { get; set; }
        public Guid? SchoolId { get; set; }
        public Guid? TeacherId { get; set; }
        public Guid? AssistantId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchKeyword { get; set; }
    }
}
