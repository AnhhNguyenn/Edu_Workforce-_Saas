using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic;
using EduOps.Application.DTOs.Academic.Sessions.Requests;
using EduOps.Application.DTOs.Academic.Sessions.Responses;
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
        private readonly ICurrentUserService _currentUserService;
        private readonly INotificationService _notificationService;

        public SessionService(IUnitOfWork unitOfWork, ICustomLogger logger, ICurrentUserService currentUserService, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _currentUserService = currentUserService;
            _notificationService = notificationService;
        }

        public async Task<PagedResult<SessionListResponseDto>> GetSessionsAsync(Guid organizationId, GetSessionListQueryDto query)
        {
            var repo = _unitOfWork.Repository<Session>();

            var result = await repo.FindPagedAsync(s =>
                s.OrganizationId == organizationId &&
                (!query.ClassId.HasValue || s.ClassId == query.ClassId.Value) &&
                (!query.SchoolId.HasValue || s.SchoolId == query.SchoolId.Value) &&
                (!query.TeacherId.HasValue || s.TeacherId == query.TeacherId.Value) &&
                (!query.AssistantId.HasValue || s.AssistantId == query.AssistantId.Value) &&
                (!query.StartDate.HasValue || s.SessionDate >= query.StartDate.Value.Date.ToUniversalTime()) &&
                (!query.EndDate.HasValue || s.SessionDate <= query.EndDate.Value.Date.ToUniversalTime()) &&
                (string.IsNullOrEmpty(query.SearchKeyword) || s.LessonTitle.ToLower().Contains(query.SearchKeyword.ToLower())),
                query.PageNumber, query.PageSize, includeProperties: "Status");

            return new PagedResult<SessionListResponseDto>
            {
                Items = result.Items.Select(s => s.ToListResponseDto()),
                TotalCount = result.TotalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };
        }

        public async Task<SessionDetailResponseDto> GetSessionByIdAsync(Guid id, Guid organizationId)
        {
            var repo = _unitOfWork.Repository<Session>();
            var session = await repo.FirstOrDefaultAsync(s => s.Id == id && s.OrganizationId == organizationId, includeProperties: "Status,Class,Teacher,Assistant");
            if (session == null)
            {
                throw new EduOps.Application.Exceptions.NotFoundException("Session", id);
            }
            return session.ToDetailResponseDto();
        }

        public async Task CheckConflictAsync(Guid organizationId, Guid? teacherId, Guid? assistantId, DateTime sessionDate, TimeSpan startTime, TimeSpan endTime, Guid? excludeSessionId = null)
        {
            var repo = _unitOfWork.Repository<Session>();
            var targetDate = sessionDate.Date.ToUniversalTime();

            // Tối ưu Performance: Tìm các session trùng lặp của Giáo viên hoặc Trợ giảng trong cùng ngày
            var exists = await repo.AnyAsync(s =>
                s.OrganizationId == organizationId &&
                (!excludeSessionId.HasValue || s.Id != excludeSessionId.Value) &&
                s.SessionDate == targetDate &&
                s.Status != null && s.Status.Code != "CANCELLED" &&
                ((teacherId.HasValue && s.TeacherId == teacherId.Value) || (assistantId.HasValue && s.AssistantId == assistantId.Value)) &&
                ((startTime >= s.StartTime && startTime < s.EndTime) ||
                 (endTime > s.StartTime && endTime <= s.EndTime) ||
                 (startTime <= s.StartTime && endTime >= s.EndTime))
            );

            if (exists)
            {
                _logger.LogWarning($"Conflict detected for Session: Teacher {teacherId} at {startTime}");
                throw new BadRequestException("Conflict detected: Teacher or Assistant is already assigned to another session at this time.");
            }
        }

        public async Task<SessionDetailResponseDto> CreateSessionAsync(Guid organizationId, CreateSessionRequestDto request)
        {
            try
            {
                // Validate Foreign Keys để chống lỗi 500
                var classEntity = await _unitOfWork.Repository<Class>().FirstOrDefaultAsync(c => c.Id == request.ClassId && c.OrganizationId == organizationId);
                if (classEntity == null)
                    throw new BadRequestException("Lớp học không tồn tại hoặc đã bị xóa.");
                    
                var schoolId = request.SchoolId != Guid.Empty ? request.SchoolId : classEntity.SchoolId;

                if (!await _unitOfWork.Repository<School>().AnyAsync(s => s.Id == schoolId && s.OrganizationId == organizationId))
                    throw new BadRequestException("Cơ sở không tồn tại hoặc đã bị xóa.");

                var userRepo = _unitOfWork.Repository<User>();
                if (request.TeacherId.HasValue)
                {
                    var teacher = await userRepo.FirstOrDefaultAsync(u => u.Id == request.TeacherId.Value, includeProperties: "Role");
                    if (teacher == null || teacher.OrganizationId != organizationId || teacher.Role?.Code != "TEACHER")
                        throw new BadRequestException("Giáo viên không hợp lệ hoặc không tồn tại.");
                }

                if (request.AssistantId.HasValue)
                {
                    var assistant = await userRepo.FirstOrDefaultAsync(u => u.Id == request.AssistantId.Value, includeProperties: "Role");
                    if (assistant == null || assistant.OrganizationId != organizationId || assistant.Role?.Code != "ASSISTANT")
                        throw new BadRequestException("Trợ giảng không hợp lệ hoặc không tồn tại.");
                }

                var repo = _unitOfWork.Repository<Session>();
                await CheckConflictAsync(organizationId, request.TeacherId, request.AssistantId, request.SessionDate, request.StartTime, request.EndTime);

                var session = new Session
                {
                    OrganizationId = organizationId,
                    ClassId = request.ClassId,
                    SchoolId = schoolId,
                    TeacherId = request.TeacherId,
                    AssistantId = request.AssistantId,
                    LessonTitle = request.LessonTitle,
                    RoomName = request.RoomName,
                    Notes = request.Notes,
                    SessionDate = request.SessionDate.Date.ToUniversalTime(),
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    StatusId = (await _unitOfWork.Repository<EduOps.Domain.Entities.SessionStatus>().FirstOrDefaultAsync(s => s.Code == "SCHEDULED"))?.Id
                };

                await repo.AddAsync(session);
                await _unitOfWork.CommitAsync();

                if (request.TeacherId.HasValue)
                {
                    await _notificationService.CreateAndSendAsync(
                        request.TeacherId.Value,
                        "Lịch dạy đột xuất",
                        $"Bạn được phân công dạy một buổi mới: {request.LessonTitle} vào ngày {request.SessionDate:dd/MM/yyyy}.",
                        "SYSTEM"
                    );
                }

                if (request.AssistantId.HasValue)
                {
                    await _notificationService.CreateAndSendAsync(
                        request.AssistantId.Value,
                        "Lịch trợ giảng đột xuất",
                        $"Bạn được phân công làm trợ giảng một buổi mới: {request.LessonTitle} vào ngày {request.SessionDate:dd/MM/yyyy}.",
                        "SYSTEM"
                    );
                }

                return session.ToDetailResponseDto();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create session with Conflict Detection.");
                throw;
            }
        }
        public async Task<SessionDetailResponseDto> UpdateSessionAsync(Guid id, Guid organizationId, EduOps.Application.DTOs.Academic.SessionRequestDto request)
        {
            var repo = _unitOfWork.Repository<Session>();
            var session = await repo.FirstOrDefaultAsync(s => s.Id == id && s.OrganizationId == organizationId);
            if (session == null) throw new NotFoundException("Session", id);

            // Ignore conflict check if Teacher/Assistant didn't change and time didn't change
            bool timeOrStaffChanged = session.TeacherId != request.TeacherId || session.AssistantId != request.AssistantId || 
                                      session.SessionDate.Date != request.SessionDate.Date || 
                                      session.StartTime != request.StartTime || session.EndTime != request.EndTime;

            if (timeOrStaffChanged)
            {
                await CheckConflictAsync(organizationId, request.TeacherId, request.AssistantId, request.SessionDate, request.StartTime, request.EndTime, id);
            }

            session.ClassId = request.ClassId;
            session.TeacherId = request.TeacherId;
            session.AssistantId = request.AssistantId;
            session.LessonTitle = request.LessonTitle;
            session.RoomName = request.RoomName;
            session.Notes = request.Notes;
            session.SessionDate = request.SessionDate.Date.ToUniversalTime();
            session.StartTime = request.StartTime;
            session.EndTime = request.EndTime;

            repo.Update(session);
            await _unitOfWork.CommitAsync();
            return session.ToDetailResponseDto();
        }

        public async Task DeleteSessionAsync(Guid id, Guid organizationId)
        {
            var repo = _unitOfWork.Repository<Session>();
            var session = await repo.FirstOrDefaultAsync(s => s.Id == id && s.OrganizationId == organizationId);
            if (session == null) throw new NotFoundException("Session", id);

            repo.Remove(session);
            await _unitOfWork.CommitAsync();
        }
    }
}
