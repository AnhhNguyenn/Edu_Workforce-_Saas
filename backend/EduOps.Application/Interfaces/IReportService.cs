using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Report;

namespace EduOps.Application.Interfaces
{
    public interface IReportService
    {
        Task<ReportDto> SubmitTeacherReportAsync(Guid sessionId, Guid teacherId, TeacherReportRequestDto request);
        Task<ReportDto> SubmitAssistantReportAsync(Guid sessionId, Guid assistantId, AssistantReportRequestDto request);
        Task<ReportDto> UploadReportMediaAsync(Guid reportId, Guid userId, string role, IFormFile file);
        Task<ReportDto> GetReportBySessionIdAsync(Guid sessionId, Guid organizationId, Guid userId, string role);
        Task<EduOps.Application.DTOs.PagedResult<ReportDto>> GetAllReportsAsync(Guid organizationId, int pageNumber = 1, int pageSize = 20);
    }
}
