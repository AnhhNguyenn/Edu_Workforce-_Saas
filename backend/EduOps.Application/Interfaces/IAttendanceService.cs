using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Attendance;

namespace EduOps.Application.Interfaces
{
    public interface IAttendanceService
    {
        Task<AttendanceDto> CheckInAsync(Guid userId, AttendanceRequestDto request);
        Task<AttendanceDto> CheckOutAsync(Guid userId, AttendanceRequestDto request);
        Task<PagedResult<AttendanceDto>> GetMyAttendancesAsync(Guid userId, int pageNumber = 1, int pageSize = 20);
        Task<List<AttendanceDto>> GetTodayAttendancesAsync(Guid organizationId);
        Task<List<AttendanceStatDto>> GetAttendanceStatsAsync(Guid organizationId, int days);
        Task<List<StaffAttendanceStatDto>> GetStaffAttendanceStatsAsync(Guid organizationId, int? month, int? year);
        Task SubmitStudentAttendancesAsync(Guid sessionId, Guid organizationId, Guid userId, string role, StudentAttendanceSubmitDto request);
    }
}
