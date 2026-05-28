using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic;

namespace EduOps.Application.Interfaces
{
    public interface ISessionService
    {
        Task<SessionDto> CreateSessionAsync(Guid organizationId, SessionRequestDto request);
    }
}
