using System;
using System.IO;
using System.Threading.Tasks;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.DTOs.Auth;
using EduOps.Application.DTOs.User.Responses;
using EduOps.Application.DTOs.User.Requests;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduOps.Application.Services
{
    public class ProfileService : IProfileService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStorageService _storageService;

        public ProfileService(IUnitOfWork unitOfWork, IStorageService storageService)
        {
            _unitOfWork = unitOfWork;
            _storageService = storageService;
        }

        public async Task<UserDetailResponseDto> GetProfileAsync(Guid userId)
        {
            var user = await _unitOfWork.Repository<User>().FirstOrDefaultAsync(u => u.Id == userId, includeProperties: "Role,Status");
            if (user == null || user.DeletedAt != null) throw new NotFoundException("User", userId);
            user.UserDetail = await _unitOfWork.Repository<UserDetail>().FirstOrDefaultAsync(d => d.UserId == userId);

            var dto = user.ToDetailResponseDto();

            if (user.OrganizationId.HasValue)
            {
                var org = await _unitOfWork.Repository<Organization>().GetByIdAsync(user.OrganizationId.Value);
                if (org != null)
                {
                    dto.OrganizationName = org.Name;
                    dto.CustomAppName = org.CustomAppName;
                    dto.CustomLogoUrl = org.CustomLogoUrl;
                }
            }

            return dto;
        }

        public async Task<string> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName, string contentType)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(userId);

            if (user == null)
                throw new NotFoundException("User", userId);
            
            user.UserDetail = await _unitOfWork.Repository<UserDetail>().FirstOrDefaultAsync(d => d.UserId == userId);

            // Upload lên Cloudflare R2
            var avatarUrl = await _storageService.UploadFileAsync(fileStream, fileName, contentType);

            if (user.UserDetail == null)
            {
                user.UserDetail = new UserDetail { UserId = user.Id };
                await _unitOfWork.Repository<UserDetail>().AddAsync(user.UserDetail);
            }

            // Xóa ảnh cũ trên R2 nếu có
            if (!string.IsNullOrEmpty(user.UserDetail.AvatarUrl))
            {
                try
                {
                    await _storageService.DeleteFileAsync(user.UserDetail.AvatarUrl);
                }
                catch
                {
                    // Ignore lỗi nếu file không tồn tại
                }
            }

            // Cập nhật URL mới
            user.UserDetail.AvatarUrl = avatarUrl;
            _unitOfWork.Repository<UserDetail>().Update(user.UserDetail);
            await _unitOfWork.CommitAsync();

            return avatarUrl;
        }

        public async Task<string> UploadOrganizationLogoAsync(Guid userId, Stream fileStream, string fileName, string contentType)
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
            if (user == null || user.OrganizationId == null)
                throw new NotFoundException("Organization for user", userId);

            var orgId = user.OrganizationId.Value;
            var org = await _unitOfWork.Repository<Organization>().GetByIdAsync(orgId);
            if (org == null)
                throw new NotFoundException("Organization", orgId);

            var logoUrl = await _storageService.UploadFileAsync(fileStream, fileName, contentType);

            if (!string.IsNullOrEmpty(org.CustomLogoUrl))
            {
                try
                {
                    await _storageService.DeleteFileAsync(org.CustomLogoUrl);
                }
                catch { }
            }

            org.CustomLogoUrl = logoUrl;
            _unitOfWork.Repository<Organization>().Update(org);
            await _unitOfWork.CommitAsync();

            return logoUrl;
        }

        public async Task UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(userId);

            if (user == null || user.DeletedAt != null)
                throw new NotFoundException("User", userId);
                
            user.UserDetail = await _unitOfWork.Repository<UserDetail>().FirstOrDefaultAsync(d => d.UserId == userId);

            // Chỉ cho phép cập nhật các trường an toàn (Họ tên, SĐT, Địa chỉ)
            if (!string.IsNullOrWhiteSpace(request.FullName))
                user.FullName = request.FullName;
            
            user.Phone = request.Phone ?? string.Empty;
            
            if (user.UserDetail == null)
            {
                user.UserDetail = new UserDetail { UserId = user.Id };
                await _unitOfWork.Repository<UserDetail>().AddAsync(user.UserDetail);
            }
            
            user.UserDetail.Address = request.Address ?? string.Empty;
            _unitOfWork.Repository<UserDetail>().Update(user.UserDetail);

            repo.Update(user);
            await _unitOfWork.CommitAsync();
        }
        public async Task<TeacherStatsResponseDto> GetStatsAsync(Guid userId, int? month, int? year)
        {
            var sessionsQuery = _unitOfWork.Repository<Session>().GetQueryable();
            var attendanceQuery = _unitOfWork.Repository<Attendance>().GetQueryable();
            var classesQuery = _unitOfWork.Repository<Class>().GetQueryable();

            // Filter sessions for the user (Teacher or Assistant)
            sessionsQuery = sessionsQuery.Where(s => s.TeacherId == userId || s.AssistantId == userId);

            // Filter by month and year if provided
            if (month.HasValue && year.HasValue)
            {
                sessionsQuery = sessionsQuery.Where(s => s.SessionDate.Month == month.Value && s.SessionDate.Year == year.Value);
            }

            // Execute queries to get data
            var sessions = await sessionsQuery.Include(s => s.Status).ToListAsync();
            var classIds = sessions.Select(s => s.ClassId).Distinct().ToList();
            var classes = await _unitOfWork.Repository<Class>().GetQueryable().Where(c => classIds.Contains(c.Id)).ToListAsync();
            
            var sessionIds = sessions.Select(s => s.Id).ToList();
            var attendances = await _unitOfWork.Repository<Attendance>().GetQueryable().Where(a => a.UserId == userId && sessionIds.Contains(a.SessionId)).ToListAsync();

            var result = new TeacherStatsResponseDto();
            result.TotalSessions = sessions.Count;

            var validSessionStatuses = new List<string> { "COMPLETED", "ONGOING", "FINISHED" }; // Assuming Finished/Completed means the session happened
            var totalCountableSessions = 0;
            var checkedInCount = 0;

            foreach (var session in sessions)
            {
                var cls = classes.FirstOrDefault(c => c.Id == session.ClassId);
                var att = attendances.FirstOrDefault(a => a.SessionId == session.Id);
                var status = session.Status?.Code ?? "UPCOMING";
                
                var statDto = new TeacherSessionStatDto
                {
                    SessionId = session.Id,
                    ClassName = cls?.Name ?? "Lớp chưa đặt tên",
                    LessonTitle = session.LessonTitle,
                    SessionDate = session.SessionDate,
                    StartTime = session.StartTime,
                    EndTime = session.EndTime,
                    SessionStatus = (EduOps.Domain.Enums.SessionStatus)System.Enum.Parse(typeof(EduOps.Domain.Enums.SessionStatus), status, true),
                    HasCheckedIn = att != null && att.CheckinTime.HasValue,
                    CheckinTime = att?.CheckinTime
                };

                // Logic Penalty 
                if (statDto.HasCheckedIn && att != null && att.CheckinTime.HasValue)
                {
                    // Calculate late minutes
                    // CheckinTime is UTC. We need to compare time of day.
                    // Assuming CheckinTime matches SessionDate and StartTime in local timezone logic, but backend works in UTC mostly.
                    // For simplicity in this demo, let's use the DB stored LateMinutes if available, else calculate.
                    statDto.LateMinutes = att.LateMinutes; 
                    
                    if (statDto.LateMinutes == 0)
                    {
                        // Fallback calculation if LateMinutes wasn't saved properly
                        var expectedStartUtc = session.SessionDate.Date.Add(session.StartTime).AddHours(-7); // Assuming GMT+7
                        if (att.CheckinTime.Value > expectedStartUtc)
                        {
                            statDto.LateMinutes = (int)(att.CheckinTime.Value - expectedStartUtc).TotalMinutes;
                        }
                    }

                    if (statDto.LateMinutes <= 10)
                    {
                        statDto.PenaltyPercentage = 0;
                        statDto.AttendanceStatus = "OK";
                    }
                    else if (statDto.LateMinutes <= 30)
                    {
                        statDto.PenaltyPercentage = 25;
                        statDto.AttendanceStatus = "LATE";
                    }
                    else
                    {
                        statDto.PenaltyPercentage = 100;
                        statDto.AttendanceStatus = "MISSED"; // Effectively missed
                    }
                }
                else
                {
                    // Not checked in
                    var expectedEndUtc = session.SessionDate.Date.Add(session.EndTime).AddHours(-7);
                    if (DateTime.UtcNow > expectedEndUtc)
                    {
                        // Past session, no checkin
                        statDto.PenaltyPercentage = 100;
                        statDto.AttendanceStatus = "MISSED";
                    }
                    else
                    {
                        statDto.AttendanceStatus = "UPCOMING";
                    }
                }

                if (validSessionStatuses.Contains(status))
                {
                    totalCountableSessions++;
                    if (statDto.HasCheckedIn)
                    {
                        checkedInCount++;
                    }
                }

                if (status == "COMPLETED") result.CompletedSessions++;

                result.Sessions.Add(statDto);
            }

            result.AttendanceRate = totalCountableSessions == 0 ? 0 : (int)Math.Round((double)checkedInCount / totalCountableSessions * 100);

            // Sort descending by date
            result.Sessions = result.Sessions.OrderByDescending(s => s.SessionDate).ThenByDescending(s => s.StartTime).ToList();

            return result;
        }
    }
}
