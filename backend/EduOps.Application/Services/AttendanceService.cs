using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Attendance;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Application.Utils;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRealtimeNotificationService _realtimeNotification;
        private readonly IStorageService _storageService;

        public AttendanceService(IUnitOfWork unitOfWork, IRealtimeNotificationService realtimeNotification, IStorageService storageService)
        {
            _unitOfWork = unitOfWork;
            _realtimeNotification = realtimeNotification;
            _storageService = storageService;
        }

        public async Task<AttendanceDto> CheckInAsync(Guid userId, AttendanceRequestDto request)
        {
            if (request.IsMockLocation)
            {
                throw new BadRequestException("Fake GPS detection alert! You are using a mock location tool.");
            }

            var sessionRepo = _unitOfWork.Repository<Session>();
            var session = await sessionRepo.FirstOrDefaultAsync(s => s.Id == request.SessionId);
            if (session == null) throw new NotFoundException("Session", request.SessionId);

            if (session.TeacherId != userId && session.AssistantId != userId)
            {
                throw new ForbiddenException("You are not assigned to this session.");
            }

            var schoolRepo = _unitOfWork.Repository<School>();
            var school = await schoolRepo.FirstOrDefaultAsync(s => s.Id == session.SchoolId, ignoreQueryFilters: true, includeProperties: "SchoolDetail");
            if (school == null) throw new NotFoundException("School", session.SchoolId);

            if (school.SchoolDetail?.Latitude.HasValue == true && school.SchoolDetail?.Longitude.HasValue == true)
            {
                var distance = GeoCalculator.HaversineDistanceInMeters(
                    request.Latitude, request.Longitude, school.SchoolDetail.Latitude.Value, school.SchoolDetail.Longitude.Value);

                if (distance > school.SchoolDetail.AttendanceRadius)
                {
                    throw new BadRequestException("OUT_OF_RANGE");
                }
            }

            var attendanceRepo = _unitOfWork.Repository<Attendance>();
            var existingRecord = await attendanceRepo.FirstOrDefaultAsync(a => a.SessionId == request.SessionId && a.UserId == userId);

            if (existingRecord != null && existingRecord.CheckinTime.HasValue)
            {
                throw new BadRequestException("You have already checked in for this session.");
            }

            var now = DateTime.UtcNow;
            
            // Fix múi giờ Việt Nam (UTC+7) để tái tạo chính xác thời gian bắt đầu ca dạy dạng UTC
            var localDate = session.SessionDate.AddHours(7).Date;
            var localStartTime = localDate.Add(session.StartTime);
            var sessionStartTimeUtc = localStartTime.AddHours(-7);

            // Check if too early (more than 5 minutes before start time)
            if (now < sessionStartTimeUtc.AddMinutes(-5))
            {
                var allowedTimeStr = session.StartTime.Add(TimeSpan.FromMinutes(-5)).ToString(@"hh\:mm");
                throw new BadRequestException($"Chưa đến giờ Check-in. Bạn chỉ có thể Check-in từ lúc {allowedTimeStr}.");
            }

            // Calculate lateness
            var lateMinutes = 0;

            string statusCode = "PRESENT";
            var lateThreshold = school.SchoolDetail?.LateThresholdMinutes ?? 3;
            if (now > sessionStartTimeUtc.AddMinutes(lateThreshold))
            {
                lateMinutes = (int)(now - sessionStartTimeUtc).TotalMinutes;
                statusCode = "LATE";
            }

            var attendance = existingRecord ?? new Attendance
            {
                SessionId = session.Id,
                UserId = userId,
                OrganizationId = session.OrganizationId
            };

            attendance.CheckinTime = now;
            attendance.CheckinLatitude = request.Latitude;
            attendance.CheckinLongitude = request.Longitude;
            attendance.LateMinutes = lateMinutes;
            var attendanceStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AttendanceStatus>().FirstOrDefaultAsync(s => s.Code == statusCode);
            attendance.StatusId = attendanceStatus?.Id;
            attendance.Note = request.Note;

            if (string.IsNullOrEmpty(request.PhotoBase64))
            {
                throw new BadRequestException("Vui lòng chụp ảnh xác nhận (selfie) khi Check-in.");
            }

            try
            {
                var base64Data = request.PhotoBase64.Contains(",") 
                    ? request.PhotoBase64.Split(',').Last() 
                    : request.PhotoBase64;
                byte[] imageBytes = Convert.FromBase64String(base64Data);
                using (var ms = new MemoryStream(imageBytes))
                {
                    string fileName = $"checkin_{session.Id}_{userId}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}.jpg";
                    string photoUrl = await _storageService.UploadFileAsync(ms, fileName, "image/jpeg");
                    attendance.CheckinImageUrl = photoUrl;
                }
            }
            catch (Exception)
            {
                throw new BadRequestException("Định dạng ảnh không hợp lệ hoặc lỗi khi tải ảnh lên.");
            }

            if (existingRecord == null)
            {
                await attendanceRepo.AddAsync(attendance);
            }
            else
            {
                attendanceRepo.Update(attendance);
            }

            await _unitOfWork.CommitAsync();

            if (session.OrganizationId.HasValue)
            {
                await _realtimeNotification.SendToOrganizationAsync(session.OrganizationId.Value, "AttendanceUpdated");
            }

            return attendance.ToDto();
        }

        public async Task<AttendanceDto> CheckOutAsync(Guid userId, AttendanceRequestDto request)
        {
            var attendanceRepo = _unitOfWork.Repository<Attendance>();
            var record = await attendanceRepo.FirstOrDefaultAsync(a => a.SessionId == request.SessionId && a.UserId == userId);

            if (record == null || !record.CheckinTime.HasValue)
            {
                throw new BadRequestException("You must check in before checking out.");
            }

            if (record.CheckoutTime.HasValue)
            {
                throw new BadRequestException("You have already checked out.");
            }

            var sessionRepo = _unitOfWork.Repository<Session>();
            var session = await sessionRepo.FirstOrDefaultAsync(s => s.Id == request.SessionId, ignoreQueryFilters: true);
            if (session == null) throw new NotFoundException("Session", request.SessionId);

            var now = DateTime.UtcNow;
            
            // Fix múi giờ Việt Nam (UTC+7) để tái tạo chính xác thời gian kết thúc ca dạy dạng UTC
            var localDate = session.SessionDate.AddHours(7).Date;
            var localEndTime = localDate.Add(session.EndTime);
            var sessionEndTimeUtc = localEndTime.AddHours(-7);
            var schoolRepo = _unitOfWork.Repository<School>();
            var school = await schoolRepo.FirstOrDefaultAsync(s => s.Id == session.SchoolId, ignoreQueryFilters: true, includeProperties: "SchoolDetail");
            if (school == null) throw new NotFoundException("School", session.SchoolId);

            if (school.SchoolDetail?.Latitude.HasValue == true && school.SchoolDetail?.Longitude.HasValue == true)
            {
                var distance = GeoCalculator.HaversineDistanceInMeters(
                    request.Latitude, request.Longitude, school.SchoolDetail.Latitude.Value, school.SchoolDetail.Longitude.Value);

                if (distance > school.SchoolDetail.AttendanceRadius)
                {
                    throw new BadRequestException("OUT_OF_RANGE");
                }
            }

            var earlyMinutes = 0;
            var earlyCheckout = school.SchoolDetail?.EarlyCheckoutMinutes ?? 15;
            if (now < sessionEndTimeUtc.AddMinutes(-earlyCheckout))
            {
                earlyMinutes = (int)(sessionEndTimeUtc - now).TotalMinutes;
                string newCode = record.Status?.Code == "LATE" ? "LATE_AND_EARLY" : "EARLY_CHECKOUT";
                var newStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AttendanceStatus>().FirstOrDefaultAsync(s => s.Code == newCode);
                record.StatusId = newStatus?.Id;
            }

            record.CheckoutTime = now;
            record.CheckoutLatitude = request.Latitude;
            record.CheckoutLongitude = request.Longitude;
            record.EarlyCheckoutMinutes = earlyMinutes;
            
            if (!string.IsNullOrEmpty(request.Note))
            {
                record.Note = string.IsNullOrEmpty(record.Note) ? request.Note : $"{record.Note} | {request.Note}";
            }

            attendanceRepo.Update(record);
            await _unitOfWork.CommitAsync();

            if (session.OrganizationId.HasValue)
            {
                await _realtimeNotification.SendToOrganizationAsync(session.OrganizationId.Value, "AttendanceUpdated");
            }

            return record.ToDto();
        }

        public async Task<PagedResult<AttendanceDto>> GetMyAttendancesAsync(Guid userId, int pageNumber, int pageSize)
        {
            var repo = _unitOfWork.Repository<Attendance>();
            var result = await repo.FindPagedAsync(a => a.UserId == userId, pageNumber, pageSize, includeProperties: "Status");

            return new PagedResult<AttendanceDto>
            {
                Items = result.Items.Select(a => a.ToDto()),
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<List<AttendanceDto>> GetTodayAttendancesAsync(Guid organizationId)
        {
            var todayUtc = DateTime.UtcNow.Date;
            var repo = _unitOfWork.Repository<Attendance>();
            var attendances = await repo.FindAsync(a => a.OrganizationId == organizationId && a.CheckinTime >= todayUtc, includeProperties: "Status");

            return attendances.Select(a => a.ToDto()).ToList();
        }

        public async Task SubmitStudentAttendancesAsync(Guid sessionId, Guid organizationId, Guid userId, string role, StudentAttendanceSubmitDto request)
        {
            var sessionRepo = _unitOfWork.Repository<Session>();
            var session = await sessionRepo.FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null || session.OrganizationId != organizationId)
                throw new NotFoundException("Session", sessionId);

            if (role != "CENTER_ADMIN" && session.TeacherId != userId && session.AssistantId != userId)
            {
                // Only assigned teachers/assistants or Center Admins can mark attendance
                throw new ForbiddenException("You are not assigned to this session.");
            }

            var classEnrollmentRepo = _unitOfWork.Repository<ClassEnrollment>();
            var enrollments = await classEnrollmentRepo.FindAsync(e => e.ClassId == session.ClassId && e.Status != null && e.Status.Code == "ENROLLED");
            var enrolledStudentIds = enrollments.Select(e => e.StudentId).ToHashSet();

            var presentStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AttendanceStatus>().FirstOrDefaultAsync(s => s.Code == "PRESENT");
            var absentStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AttendanceStatus>().FirstOrDefaultAsync(s => s.Code == "ABSENT");

            // Lọc các bản ghi trùng lặp (nếu Client vô tình gửi 2 lần cùng 1 học sinh)
            var uniqueRecords = request.Records
                .GroupBy(r => r.StudentId)
                .Select(g => g.First())
                .ToList();

            var studentAttendanceRepo = _unitOfWork.Repository<StudentSessionAttendance>();
            var existingAttendances = await studentAttendanceRepo.FindAsync(sa => sa.SessionId == sessionId);

            foreach (var record in uniqueRecords)
            {
                if (!enrolledStudentIds.Contains(record.StudentId))
                {
                    throw new BadRequestException($"Học viên ID {record.StudentId} không có trong danh sách chính thức của lớp học này.");
                }

                var existing = existingAttendances.FirstOrDefault(sa => sa.StudentId == record.StudentId);
                if (existing != null)
                {
                    existing.IsPresent = record.IsPresent;
                    existing.StatusId = record.IsPresent ? presentStatus?.Id : absentStatus?.Id;
                    existing.Note = record.Note;
                    studentAttendanceRepo.Update(existing);
                }
                else
                {
                    var newAttendance = new StudentSessionAttendance
                    {
                        OrganizationId = organizationId,
                        SessionId = sessionId,
                        StudentId = record.StudentId,
                        IsPresent = record.IsPresent,
                        StatusId = record.IsPresent ? presentStatus?.Id : absentStatus?.Id,
                        Note = record.Note
                    };
                    await studentAttendanceRepo.AddAsync(newAttendance);
                }
            }

            await _unitOfWork.CommitAsync();
            await _realtimeNotification.SendToOrganizationAsync(organizationId, "AttendanceUpdated");
        }

        public async Task<List<AttendanceStatDto>> GetAttendanceStatsAsync(Guid organizationId, int days)
        {
            var endDate = DateTime.UtcNow;
            var startDate = endDate.AddDays(-days + 1).Date; // include today

            var sessionRepo = _unitOfWork.Repository<Session>();
            var attendanceRepo = _unitOfWork.Repository<Attendance>();

            var sessions = await sessionRepo.FindAsync(s => s.OrganizationId == organizationId && s.SessionDate >= startDate && s.SessionDate <= endDate);
            var sessionIds = sessions.Select(s => s.Id).ToList();

            var attendances = new List<Attendance>();
            if (sessionIds.Any())
            {
                attendances = (await attendanceRepo.FindAsync(a => sessionIds.Contains(a.SessionId))).ToList();
            }

            var stats = new List<AttendanceStatDto>();

            for (int i = days - 1; i >= 0; i--)
            {
                var targetDate = endDate.AddDays(-i).Date;
                var sessionsOnDay = sessions.Where(s => s.SessionDate.Date == targetDate).ToList();
                
                int total = sessionsOnDay.Count;
                int checkedIn = 0;

                foreach(var s in sessionsOnDay)
                {
                    if (attendances.Any(a => a.SessionId == s.Id && a.CheckinTime != null))
                    {
                        checkedIn++;
                    }
                }

                double rate = total == 0 ? 0 : Math.Round((double)checkedIn / total * 100, 1);

                string[] dayNames = { "CN", "T2", "T3", "T4", "T5", "T6", "T7" };
                string dayName = dayNames[(int)targetDate.DayOfWeek];

                stats.Add(new AttendanceStatDto
                {
                    Date = dayName,
                    TotalSessions = total,
                    CheckedInCount = checkedIn,
                    AttendanceRate = rate
                });
            }

            return stats;
        }
        public async Task<List<StaffAttendanceStatDto>> GetStaffAttendanceStatsAsync(Guid organizationId, int? month, int? year)
        {
            var sessionRepo = _unitOfWork.Repository<Session>();
            var attendanceRepo = _unitOfWork.Repository<Attendance>();
            var userRepo = _unitOfWork.Repository<EduOps.Domain.Entities.User>();

            // Get users (Teacher & Assistant)
            var staffUsers = await userRepo.FindAsync(u => u.OrganizationId == organizationId && u.Role != null && (u.Role.Code == "TEACHER" || u.Role.Code == "ASSISTANT"));

            var startDate = DateTime.MinValue;
            var endDate = DateTime.MaxValue;

            if (month.HasValue && year.HasValue)
            {
                startDate = new DateTime(year.Value, month.Value, 1, 0, 0, 0, DateTimeKind.Utc);
                endDate = startDate.AddMonths(1).AddTicks(-1);
            }
            else if (!month.HasValue && !year.HasValue)
            {
                // Default: get all time, or maybe we don't filter date
                // Actually the requirement: "Tất cả" => no date filter
            }
            
            var sessions = await sessionRepo.FindAsync(s => s.OrganizationId == organizationId 
                                                            && (s.SessionDate >= startDate && s.SessionDate <= endDate));
                                                            
            var sessionIds = sessions.Select(s => s.Id).ToList();
            var attendances = new List<Attendance>();
            if (sessionIds.Any())
            {
                attendances = (await attendanceRepo.FindAsync(a => sessionIds.Contains(a.SessionId))).ToList();
            }

            var result = new List<StaffAttendanceStatDto>();
            var now = DateTime.UtcNow;

            foreach (var user in staffUsers)
            {
                var userSessions = sessions.Where(s => s.TeacherId == user.Id || (s.AssistantId == user.Id)).ToList(); // Adjusted to check AssistantId if single, but in DB it's AssistantId
                
                // Exclude future sessions from stats calculation
                var pastSessions = userSessions.Where(s => s.SessionDate < now.Date || (s.SessionDate == now.Date && s.EndTime < now.TimeOfDay)).ToList();

                int total = pastSessions.Count;
                int checkedIn = 0;
                int late = 0;
                int earlyCO = 0;
                int missingCO = 0;
                int absent = 0;

                foreach (var s in pastSessions)
                {
                    var att = attendances.FirstOrDefault(a => a.SessionId == s.Id && a.UserId == user.Id);
                    if (att != null && att.CheckinTime != null)
                    {
                        checkedIn++;
                        if (att.LateMinutes > 0) late++;
                        
                        if (att.CheckoutTime != null)
                        {
                            if (att.EarlyCheckoutMinutes > 0) earlyCO++;
                        }
                        else
                        {
                            missingCO++;
                        }
                    }
                    else
                    {
                        absent++;
                    }
                }

                if (total > 0)
                {
                    result.Add(new StaffAttendanceStatDto
                    {
                        UserId = user.Id,
                        FullName = user.FullName,
                        Role = user.Role?.Code ?? string.Empty,
                        TotalSessions = total,
                        CheckedInCount = checkedIn,
                        LateCount = late,
                        EarlyCheckoutCount = earlyCO,
                        MissingCheckoutCount = missingCO,
                        AbsentCount = absent,
                        AttendanceRate = Math.Round((double)checkedIn / total * 100, 1)
                    });
                }
            }

            return result.OrderByDescending(x => x.AttendanceRate).ThenByDescending(x => x.TotalSessions).ToList();
        }

        public async Task ConfirmExplanationAsync(Guid id)
        {
            var attendanceRepo = _unitOfWork.Repository<Attendance>();
            var attendance = await attendanceRepo.FirstOrDefaultAsync(a => a.Id == id);
            if (attendance == null) throw new NotFoundException("Attendance", id);

            if (string.IsNullOrEmpty(attendance.Note))
            {
                attendance.Note = "[Quản lý đã xác nhận]";
            }
            else if (!attendance.Note.Contains("[Quản lý đã xác nhận]"))
            {
                attendance.Note = "[Quản lý đã xác nhận] " + attendance.Note;
            }

            attendanceRepo.Update(attendance);
            await _unitOfWork.CommitAsync();
        }
    }
}
