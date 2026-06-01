using System;

namespace EduOps.Application.DTOs.User.Requests
{
    public class GetUserListQueryDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchKeyword { get; set; }
        public Guid? FilterOrgId { get; set; }
    }
}
