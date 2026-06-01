using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
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

        public SessionService(IUnitOfWork unitOfWork, ICustomLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<PagedResult<SessionListResponseDto>> GetSessionsAsync(Guid organizationId, GetSessionListQueryDto query)
        {
            var repo = _unitOfWork.Repository<Session>();
            
            var result = await repo.FindPagedAsync(s => 
                s.OrganizationId == organizationId &&
                (!query.ClassId.HasValue || s.ClassId == query.ClassId.Value) &&
                (!query.TeacherId.HasValue || s.TeacherId == query.TeacherId.Value) &&
                (!query.Date.HasValue || s.SessionDate.Date == query.Date.Value.Date) &&
                (string.IsNullOrEmpty(query.SearchKeyword) || s.LessonTitle.ToLower().Contains(query.SearchKeyword.ToLower())), 
                query.PageNumber, query.PageSize);

            return new PagedResult<SessionListResponseDto>
            {
                Items = result.Items.Select(s => s.ToListResponseDto()),
                TotalCount = result.TotalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };
        }

        public async Task CheckConflictAsync(Guid organizationId, Guid teacherId, Guid? assistantId, DateTime sessionDate, TimeSpan startTime, TimeSpan endTime)
        {
            var repo = _unitOfWork.Repository<Session>();

            // Tối ưu Performance: Tìm các session trùng lặp của Giáo viên hoặc Trợ giảng trong cùng ngày
            var exists = await repo.AnyAsync(s => 
                s.OrganizationId == organizationId &&
                s.SessionDate.Date == sessionDate.Date &&
                s.Status != SessionStatus.CANCELLED &&
                (s.TeacherId == teacherId || (assistantId.HasValue && s.AssistantId == assistantId.Value)) &&
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
                if (!await _unitOfWork.Repository<School>().AnyAsync(s => s.Id == request.SchoolId && s.OrganizationId == organizationId))
                    throw new BadRequestException("Cơ sở không tồn tại hoặc đã bị xóa.");
                if (!await _unitOfWork.Repository<Class>().AnyAsync(c => c.Id == request.ClassId && c.OrganizationId == organizationId))
                    throw new BadRequestException("Lớp học không tồn tại hoặc đã bị xóa.");
                var userRepo = _unitOfWork.Repository<User>();
                var teacher = await userRepo.GetByIdAsync(request.TeacherId);
                if (teacher == null || teacher.OrganizationId != organizationId || teacher.Role != "TEACHER")
                    throw new BadRequestException("Giáo viên không hợp lệ hoặc không tồn tại.");
                    
                if (request.AssistantId.HasValue)
                {
                    var assistant = await userRepo.GetByIdAsync(request.AssistantId.Value);
                    if (assistant == null || assistant.OrganizationId != organizationId || assistant.Role != "ASSISTANT")
                        throw new BadRequestException("Trợ giảng không hợp lệ hoặc không tồn tại.");
                }

                var repo = _unitOfWork.Repository<Session>();
                await CheckConflictAsync(organizationId, request.TeacherId, request.AssistantId, request.SessionDate, request.StartTime, request.EndTime);

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

                return session.ToDetailResponseDto();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create session with Conflict Detection.");
                throw;
            }
        }
    }
}
