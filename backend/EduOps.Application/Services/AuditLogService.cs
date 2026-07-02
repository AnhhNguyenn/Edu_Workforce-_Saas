using System;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.SystemSettings.Responses;
using EduOps.Application.Interfaces;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduOps.Application.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public AuditLogService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task LogActionAsync(string action, string entityType, Guid entityId, string? oldData = null, string? newData = null)
        {
            var userId = _currentUserService.UserId;
            var orgId = _currentUserService.OrganizationId;
            var ip = _currentUserService.IpAddress;

            var log = new AuditLog
            {
                UserId = userId,
                OrganizationId = orgId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                OldData = oldData,
                NewData = newData,
                IpAddress = ip
            };

            await _unitOfWork.Repository<AuditLog>().AddAsync(log);
            await _unitOfWork.CommitAsync();
        }

        public async Task<PagedResult<AuditLogResponseDto>> GetTenantAuditLogsAsync(
            Guid organizationId, 
            int pageNumber = 1, 
            int pageSize = 100, 
            string? type = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? action = null,
            string? keyword = null
        )
        {
            var query = _unitOfWork.Repository<AuditLog>()
                .GetQueryable()
                .IgnoreQueryFilters()
                .Where(x => x.OrganizationId == organizationId);

            if (type == "security")
            {
                query = query.Where(x => x.EntityType == "Security");
            }
            else
            {
                query = query.Where(x => x.EntityType != "Security");
            }

            if (startDate.HasValue)
            {
                var start = startDate.Value.ToUniversalTime();
                query = query.Where(x => x.CreatedAt >= start);
            }

            if (endDate.HasValue)
            {
                var end = endDate.Value.ToUniversalTime();
                query = query.Where(x => x.CreatedAt <= end);
            }

            if (!string.IsNullOrEmpty(action) && action != "all")
            {
                query = query.Where(x => x.Action.ToLower() == action.ToLower());
            }

            if (!string.IsNullOrEmpty(keyword))
            {
                var keywordLower = keyword.ToLower();
                var matchingUserIds = await _unitOfWork.Repository<User>().GetQueryable()
                    .IgnoreQueryFilters()
                    .Where(u => u.OrganizationId == organizationId && (u.FullName.ToLower().Contains(keywordLower) || u.Email.ToLower().Contains(keywordLower)))
                    .Select(u => u.Id)
                    .ToListAsync();
                
                query = query.Where(x => matchingUserIds.Contains(x.UserId));
            }

            query = query.OrderByDescending(x => x.CreatedAt);

            var totalCount = await query.CountAsync();
            var logs = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            var userIds = logs.Select(x => x.UserId).Distinct().ToList();
            var users = await _unitOfWork.Repository<User>()
                .GetQueryable()
                .IgnoreQueryFilters()
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u);

            var dtos = logs.Select(x => new AuditLogResponseDto
            {
                Id = x.Id,
                UserId = x.UserId,
                UserEmail = users.ContainsKey(x.UserId) ? users[x.UserId].Email : "Unknown",
                UserName = users.ContainsKey(x.UserId) ? users[x.UserId].FullName : "Unknown",
                Action = x.Action,
                EntityType = x.EntityType,
                EntityId = x.EntityId,
                OldData = x.OldData,
                NewData = x.NewData,
                IpAddress = x.IpAddress,
                UserAgent = x.UserAgent,
                CreatedAt = x.CreatedAt
            }).ToList();

            return new PagedResult<AuditLogResponseDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
    }
}
