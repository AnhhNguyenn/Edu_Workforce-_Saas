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
        Task<System.Collections.Generic.List<SessionDetailResponseDto>> CreateBatchSessionsAsync(Guid organizationId, BatchCreateSessionRequestDto request);
        Task<EduOps.Application.DTOs.Academic.Sessions.Responses.SessionImportPreviewResponseDto> PreviewImportSessionsFromExcelAsync(Guid organizationId, ImportSessionRequestDto request);
        Task<System.Collections.Generic.List<SessionDetailResponseDto>> ConfirmImportSessionsAsync(Guid organizationId, EduOps.Application.DTOs.Academic.Sessions.Responses.SessionImportPreviewResponseDto request);
        Task<System.Collections.Generic.List<SessionDetailResponseDto>> ImportSessionsFromExcelAsync(Guid organizationId, ImportSessionRequestDto request);
        Task<SessionDetailResponseDto> UpdateSessionAsync(Guid id, Guid organizationId, EduOps.Application.DTOs.Academic.SessionRequestDto request);
        Task<System.Collections.Generic.List<SessionDetailResponseDto>> BatchUpdateStaffAsync(Guid organizationId, BatchUpdateStaffRequestDto request);
        Task DeleteSessionAsync(Guid id, Guid organizationId);
        Task CheckConflictAsync(Guid organizationId, Guid? teacherId, System.Collections.Generic.List<Guid>? assistantIds, DateTime sessionDate, TimeSpan startTime, TimeSpan endTime, Guid? excludeSessionId = null);
        Task<System.Collections.Generic.List<TenantCustomFieldDto>> GetSessionCustomFieldsAsync(Guid organizationId);
    }
}
