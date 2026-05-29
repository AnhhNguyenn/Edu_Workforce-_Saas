using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class SessionService : ISessionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICustomLogger _logger;

        public SessionService(IUnitOfWork unitOfWork, ICustomLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<PagedResult<SessionDto>> GetSessionsAsync(Guid organizationId, Guid? classId, Guid? teacherId, DateTime? date, int pageNumber, int pageSize)
        {
            var repo = _unitOfWork.Repository<Session>();
            
            var result = await repo.FindPagedAsync(s => 
                s.OrganizationId == organizationId &&
                (!classId.HasValue || s.ClassId == classId.Value) &&
                (!teacherId.HasValue || s.TeacherId == teacherId.Value) &&
                (!date.HasValue || s.SessionDate.Date == date.Value.Date), 
                pageNumber, pageSize);

            return new PagedResult<SessionDto>
            {
                Items = result.Items.Select(s => s.ToDto()),
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<SessionDto> CreateSessionAsync(Guid organizationId, SessionRequestDto request)
        {
            try
            {
                var repo = _unitOfWork.Repository<Session>();

                // Tối ưu Performance: Tìm các session trùng lặp của Giáo viên hoặc Trợ giảng trong cùng ngày
                var conflicts = await repo.FindAsync(s => 
                    s.OrganizationId == organizationId &&
                    s.SessionDate.Date == request.SessionDate.Date &&
                    s.Status != SessionStatus.CANCELLED &&
                    (s.TeacherId == request.TeacherId || (request.AssistantId.HasValue && s.AssistantId == request.AssistantId.Value))
                );

                // Check trùng giờ
                var overlapping = conflicts.FirstOrDefault(s => 
                    (request.StartTime >= s.StartTime && request.StartTime < s.EndTime) || 
                    (request.EndTime > s.StartTime && request.EndTime <= s.EndTime) ||
                    (request.StartTime <= s.StartTime && request.EndTime >= s.EndTime)
                );

                if (overlapping != null)
                {
                    _logger.LogWarning($"Conflict detected for Session: Teacher {request.TeacherId} at {request.StartTime}");
                    throw new Exception("Conflict detected: Teacher or Assistant is already assigned to another session at this time.");
                }

                var session = new Session
                {
                    OrganizationId = organizationId,
                    ClassId = request.ClassId,
                    SchoolId = request.SchoolId,
                    TeacherId = request.TeacherId,
                    AssistantId = request.AssistantId,
                    LessonTitle = request.LessonTitle,
                    SessionDate = request.SessionDate.Date,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    Status = SessionStatus.SCHEDULED
                };

                await repo.AddAsync(session);
                await _unitOfWork.CommitAsync();

                return session.ToDto();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create session with Conflict Detection.");
                throw;
            }
        }
    }
}
