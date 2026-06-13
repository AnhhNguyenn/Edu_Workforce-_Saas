using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic;
using EduOps.Application.DTOs.Academic.Sessions.Requests;
using EduOps.Application.DTOs.Academic.Sessions.Responses;

namespace EduOps.Application.Interfaces
{
    public interface ISessionService
    {
        Task<PagedResult<SessionListResponseDto>> GetSessionsAsync(Guid organizationId, GetSessionListQueryDto query);
        Task<SessionDetailResponseDto> GetSessionByIdAsync(Guid id, Guid organizationId);
        Task<SessionDetailResponseDto> CreateSessionAsync(Guid organizationId, CreateSessionRequestDto request);
        Task<SessionDetailResponseDto> UpdateSessionAsync(Guid id, Guid organizationId, EduOps.Application.DTOs.Academic.SessionRequestDto request);
        Task DeleteSessionAsync(Guid id, Guid organizationId);
        Task CheckConflictAsync(Guid organizationId, Guid? teacherId, Guid? assistantId, DateTime sessionDate, TimeSpan startTime, TimeSpan endTime, Guid? excludeSessionId = null);
    }
}
