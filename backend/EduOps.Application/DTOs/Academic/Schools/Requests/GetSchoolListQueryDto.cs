using System;

namespace EduOps.Application.DTOs.Academic.Schools.Requests
{
    public class GetSchoolListQueryDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchKeyword { get; set; }
    }
}
