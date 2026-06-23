using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.SystemBroadcast;

namespace EduOps.Application.Interfaces
{
    public interface ISystemBroadcastService
    {
        Task<PagedResult<SystemBroadcastDto>> GetPagedAsync(int pageNumber, int pageSize);
        Task<SystemBroadcastDto> GetByIdAsync(Guid id);
        Task<SystemBroadcastDto> CreateAsync(CreateSystemBroadcastDto dto);
        Task<SystemBroadcastDto> UpdateAsync(Guid id, UpdateSystemBroadcastDto dto);
        Task DeleteAsync(Guid id);
        
        Task SendAsync(Guid id);
        Task RecallAsync(Guid id);
    }
}
