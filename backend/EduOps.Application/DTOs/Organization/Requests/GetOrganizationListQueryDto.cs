using System;

namespace EduOps.Application.DTOs.Organization.Requests
{
    public class GetOrganizationListQueryDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchKeyword { get; set; }
        public EduOps.Domain.Enums.AccountStatus? Status { get; set; }
    }
}
