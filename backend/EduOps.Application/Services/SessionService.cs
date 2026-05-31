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

        public async Task<PagedResult<SessionDto>> GetSessionsAsync(Guid organizationId, Guid? classId, Guid? teacherId, DateTime? date, int pageNumber, int pageSize, string? searchKeyword = null)
        {
            var repo = _unitOfWork.Repository<Session>();
            
            var result = await repo.FindPagedAsync(s => 
                s.OrganizationId == organizationId &&
                (!classId.HasValue || s.ClassId == classId.Value) &&
                (!teacherId.HasValue || s.TeacherId == teacherId.Value) &&
                (!date.HasValue || s.SessionDate.Date == date.Value.Date) &&
                (string.IsNullOrEmpty(searchKeyword) || s.LessonTitle.Contains(searchKeyword)), 
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
                // Validate Foreign Keys để chống lỗi 500
                if (!await _unitOfWork.Repository<School>().AnyAsync(s => s.Id == request.SchoolId && s.OrganizationId == organizationId))
                    throw new BadRequestException("Cơ sở không tồn tại hoặc đã bị xóa.");
                if (!await _unitOfWork.Repository<Class>().AnyAsync(c => c.Id == request.ClassId && c.OrganizationId == organizationId))
                    throw new BadRequestException("Lớp học không tồn tại hoặc đã bị xóa.");
                if (!await _unitOfWork.Repository<User>().AnyAsync(u => u.Id == request.TeacherId && u.OrganizationId == organizationId))
                    throw new BadRequestException("Giáo viên không tồn tại hoặc đã bị xóa.");
                if (request.AssistantId.HasValue && !await _unitOfWork.Repository<User>().AnyAsync(u => u.Id == request.AssistantId.Value && u.OrganizationId == organizationId))
                    throw new BadRequestException("Trợ giảng không tồn tại hoặc đã bị xóa.");

                var repo = _unitOfWork.Repository<Session>();

                // Tối ưu Performance: Tìm các session trùng lặp của Giáo viên hoặc Trợ giảng trong cùng ngày
                var requestUsers = new List<Guid> { request.TeacherId };
                if (request.AssistantId.HasValue) requestUsers.Add(request.AssistantId.Value);

                var conflicts = await repo.FindAsync(s => 
                    s.OrganizationId == organizationId &&
                    s.SessionDate.Date == request.SessionDate.Date &&
                    s.Status != SessionStatus.CANCELLED &&
                    (requestUsers.Contains(s.TeacherId) || (s.AssistantId.HasValue && requestUsers.Contains(s.AssistantId.Value)))
                );

                // Check trùng giờ
                var overlapping = conflicts.FirstOrDefault(s => 
                    (request.StartTime >= s.StartTime && request.StartTime < s.EndTime) || 
                    (request.EndTime > s.StartTime && request.EndTime <= s.EndTime) ||
                    (request.StartTime <= s.StartTime && request.EndTime >= s.EndTime)
                );

                if (overlapping != null)
                {
                    _logger.LogWarning($"Conflict detected for Session at {request.StartTime}");
                    throw new BadRequestException("Phát hiện trùng lịch: Giáo viên hoặc Trợ giảng đã có lịch dạy/hỗ trợ ở một ca khác trong cùng khung giờ.");
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
