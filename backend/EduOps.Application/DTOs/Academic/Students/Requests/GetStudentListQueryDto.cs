using System;

namespace EduOps.Application.DTOs.Academic.Students.Requests
{
    public class GetStudentListQueryDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchKeyword { get; set; }
    }
}
