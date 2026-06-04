using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic.Sessions.Requests;
using EduOps.Application.DTOs.Academic.Sessions.Responses;

namespace EduOps.Application.Interfaces
{
    public interface ISessionService
    {
        Task<PagedResult<SessionListResponseDto>> GetSessionsAsync(Guid organizationId, GetSessionListQueryDto query);
        Task<SessionDetailResponseDto> GetSessionByIdAsync(Guid id, Guid organizationId);
        Task<SessionDetailResponseDto> CreateSessionAsync(Guid organizationId, CreateSessionRequestDto request);
        Task CheckConflictAsync(Guid organizationId, Guid teacherId, Guid? assistantId, DateTime sessionDate, TimeSpan startTime, TimeSpan endTime);
    }
}
