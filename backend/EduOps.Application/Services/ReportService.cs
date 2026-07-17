using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Report;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStorageService _storageService;
        private readonly ICurrentUserService _currentUserService;

        public ReportService(IUnitOfWork unitOfWork, IStorageService storageService, ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _storageService = storageService;
            _currentUserService = currentUserService;
        }

        private async Task<Report> GetOrCreateReportAsync(Guid sessionId)
        {
            var reportRepo = _unitOfWork.Repository<Report>();
            var report = await reportRepo.FirstOrDefaultAsync(r => r.SessionId == sessionId, includeProperties: "ReportDetail");

            if (report == null)
            {
                var session = await _unitOfWork.Repository<Session>().FirstOrDefaultAsync(s => s.Id == sessionId);
                if (session == null) throw new NotFoundException("Session", sessionId);

                var attendances = await _unitOfWork.Repository<StudentSessionAttendance>().FindAsync(a => a.SessionId == sessionId);
                int presentCount = attendances.Count(a => a.IsPresent);
                int absentCount = attendances.Count(a => !a.IsPresent);

                report = new Report
                {
                    SessionId = sessionId,
                    TeacherId = session.TeacherId.GetValueOrDefault(),
                    AssistantId = session.AssistantId,
                    OrganizationId = session.OrganizationId,
                    AttendanceCount = presentCount,
                    AbsentCount = absentCount,
                    StatusId = (await _unitOfWork.Repository<EduOps.Domain.Entities.ReportStatus>().FirstOrDefaultAsync(s => s.Code == "DRAFT"))?.Id
                };
                await reportRepo.AddAsync(report);
                await _unitOfWork.CommitAsync();
            }
            return report;
        }

        public async Task<ReportDto> SubmitTeacherReportAsync(Guid sessionId, Guid teacherId, TeacherReportRequestDto request)
        {
            var report = await GetOrCreateReportAsync(sessionId);

            var isAssigned = await _unitOfWork.Repository<SessionTeacher>()
                .AnyAsync(st => st.SessionId == sessionId && st.TeacherId == teacherId && st.DeletedAt == null);

            if (!isAssigned)
            {
                var session = await _unitOfWork.Repository<Session>().FirstOrDefaultAsync(s => s.Id == sessionId);
                if (session?.TeacherId == teacherId)
                {
                    isAssigned = true;
                }
            }

            if (!isAssigned)
                throw new ForbiddenException("Only the assigned teacher can submit this part of the report.");

            report.TeacherId = teacherId;

            if (report.ReportDetail == null) report.ReportDetail = new EduOps.Domain.Entities.ReportDetail { ReportId = report.Id };
            report.ReportDetail.LessonTaught = request.LessonTaught;
            report.ReportDetail.Progress = request.Progress;
            report.ReportDetail.TeacherComment = request.TeacherComment;
            report.ReportDetail.SpecialStudents = request.SpecialStudents;
            report.ReportDetail.RatingForAssistant = request.RatingForAssistant;
            report.ReportDetail.FeedbackForAssistant = request.FeedbackForAssistant;

            var submittedStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.ReportStatus>().FirstOrDefaultAsync(s => s.Code == "SUBMITTED");
            report.StatusId = submittedStatus?.Id;
            report.SubmittedAt = DateTime.UtcNow;

            _unitOfWork.Repository<Report>().Update(report);
            await _unitOfWork.CommitAsync();

            return await GetReportBySessionIdAsync(sessionId, _currentUserService.OrganizationId ?? Guid.Empty, _currentUserService.UserId, _currentUserService.Role);
        }

        public async Task<ReportDto> SubmitAssistantReportAsync(Guid sessionId, Guid assistantId, AssistantReportRequestDto request)
        {
            var report = await GetOrCreateReportAsync(sessionId);

            var isAssigned = await _unitOfWork.Repository<SessionAssistant>()
                .AnyAsync(sa => sa.SessionId == sessionId && sa.AssistantId == assistantId && sa.DeletedAt == null);

            if (!isAssigned)
            {
                var session = await _unitOfWork.Repository<Session>().FirstOrDefaultAsync(s => s.Id == sessionId);
                if (session?.AssistantId == assistantId)
                {
                    isAssigned = true;
                }
            }

            if (!isAssigned)
                throw new ForbiddenException("Only the assigned assistant can submit this part of the report.");

            report.AssistantId = assistantId;

            if (report.ReportDetail == null) report.ReportDetail = new EduOps.Domain.Entities.ReportDetail { ReportId = report.Id };
            report.ReportDetail.AssistantNote = request.AssistantNote;
            report.ReportDetail.RatingForTeacher = request.RatingForTeacher;
            report.ReportDetail.FeedbackForTeacher = request.FeedbackForTeacher;

            _unitOfWork.Repository<Report>().Update(report);
            await _unitOfWork.CommitAsync();

            return await GetReportBySessionIdAsync(sessionId, _currentUserService.OrganizationId ?? Guid.Empty, _currentUserService.UserId, _currentUserService.Role);
        }

        public async Task<ReportDto> UploadReportMediaAsync(Guid reportId, Guid userId, string role, IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new BadRequestException("File is empty.");

            if (file.Length > 5 * 1024 * 1024)
                throw new BadRequestException("File size exceeds 5MB limit.");

            var reportRepo = _unitOfWork.Repository<Report>();
            var report = await reportRepo.GetByIdAsync(reportId);
            if (report == null) throw new NotFoundException("Report", reportId);

            if (role != "CENTER_ADMIN" && report.TeacherId != userId && report.AssistantId != userId)
                throw new ForbiddenException("You don't have permission to upload media to this report.");

            string extension = System.IO.Path.GetExtension(file.FileName);
            string uniqueFileName = $"reports/{reportId}/{Guid.NewGuid()}{extension}";

            using var stream = file.OpenReadStream();
            string fileUrl = await _storageService.UploadFileAsync(stream, uniqueFileName, file.ContentType);

            var media = new ReportMedia
            {
                ReportId = reportId,
                FileName = file.FileName,
                FileUrl = fileUrl,
                FileSize = file.Length,
                MimeType = file.ContentType,
                UploadedBy = userId
            };

            await _unitOfWork.Repository<ReportMedia>().AddAsync(media);
            await _unitOfWork.CommitAsync();

            return await GetReportBySessionIdAsync(report.SessionId, _currentUserService.OrganizationId ?? Guid.Empty, _currentUserService.UserId, _currentUserService.Role);
        }

        public async Task<ReportDto> GetReportBySessionIdAsync(Guid sessionId, Guid organizationId, Guid userId, string role)
        {
            var report = await _unitOfWork.Repository<Report>().FirstOrDefaultAsync(r => r.SessionId == sessionId, includeProperties: "Status,ReportDetail");
            if (report == null || report.OrganizationId != organizationId) throw new NotFoundException("Report", sessionId);

            if (role != "CENTER_ADMIN" && report.TeacherId != userId && report.AssistantId != userId)
                throw new ForbiddenException("Bạn không có quyền xem báo cáo này.");

            var media = (await _unitOfWork.Repository<ReportMedia>().FindAsync(m => m.ReportId == report.Id)).ToList();

            return report.ToDto(media);
        }
        public async Task<EduOps.Application.DTOs.PagedResult<ReportDto>> GetAllReportsAsync(Guid organizationId, int pageNumber = 1, int pageSize = 20)
        {
            var pagedData = await _unitOfWork.Repository<Report>().FindPagedAsync(
                r => r.OrganizationId == organizationId,
                pageNumber,
                pageSize,
                includeProperties: "Status,ReportDetail"
            );

            // Since ReportDto uses .ToDto(mediaList), and we are returning a paged result, 
            // for performance we might skip media list or query it efficiently. 
            // We will just pass an empty list for media in the summary list.
            var dtos = pagedData.Items.Select(r => 
            {
                var dto = r.ToDto(new System.Collections.Generic.List<ReportMedia>());
                // Optional: Map Session/Class/Teacher names if you added them to ReportDto, 
                // but since ReportDto usually is bound, we just return it.
                return dto;
            }).ToList();

            return new EduOps.Application.DTOs.PagedResult<ReportDto>
            {
                Items = dtos,
                TotalCount = pagedData.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
    }
}
