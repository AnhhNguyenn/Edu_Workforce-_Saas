using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic;

namespace EduOps.Application.Interfaces
{
    public interface ISessionService
    {
        Task<PagedResult<SessionDto>> GetSessionsAsync(Guid organizationId, Guid? classId, Guid? teacherId, DateTime? date, int pageNumber, int pageSize);
        Task<SessionDto> CreateSessionAsync(Guid organizationId, SessionRequestDto request);
    }
}
