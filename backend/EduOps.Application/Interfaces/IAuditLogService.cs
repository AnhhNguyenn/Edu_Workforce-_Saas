using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs.SystemSettings.Responses;

namespace EduOps.Application.Interfaces
{
    public interface IAuditLogService
    {
        Task LogActionAsync(string action, string entityType, Guid entityId, string? oldData = null, string? newData = null);
        Task<EduOps.Application.DTOs.PagedResult<AuditLogResponseDto>> GetTenantAuditLogsAsync(Guid organizationId, int pageNumber = 1, int pageSize = 100, string? type = null);
    }
}
