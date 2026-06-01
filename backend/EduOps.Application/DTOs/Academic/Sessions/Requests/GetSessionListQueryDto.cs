using System;

namespace EduOps.Application.DTOs.Academic.Sessions.Requests
{
    public class GetSessionListQueryDto
    {
        public Guid? ClassId { get; set; }
        public Guid? TeacherId { get; set; }
        public DateTime? Date { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchKeyword { get; set; }
    }
}
