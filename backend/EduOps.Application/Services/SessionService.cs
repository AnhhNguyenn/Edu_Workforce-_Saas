using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
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

        public async Task<SessionDto> CreateSessionAsync(Guid organizationId, SessionRequestDto request)
        {
            try
            {
                var repo = _unitOfWork.Repository<Session>();

                // Tối ưu Performance: Tìm các session trùng lặp của Giáo viên hoặc Trợ giảng trong cùng ngày
                var conflicts = await repo.FindAsync(s => 
                    s.OrganizationId == organizationId &&
                    s.SessionDate.Date == request.SessionDate.Date &&
                    s.Status != "CANCELLED" &&
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
                    Status = "SCHEDULED"
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
