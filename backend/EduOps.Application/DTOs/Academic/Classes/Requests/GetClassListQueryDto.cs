using System;

namespace EduOps.Application.DTOs.Academic.Classes.Requests
{
    public class GetClassListQueryDto
    {
        public Guid? SchoolId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchKeyword { get; set; }
    }
}
