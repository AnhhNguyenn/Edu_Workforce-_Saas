using System;
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

        public AttendanceService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
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
                    throw new BadRequestException($"You are out of the attendance zone. Distance: {Math.Round(distance)}m, Max allowed: {school.SchoolDetail.AttendanceRadius}m.");
                }
            }

            var attendanceRepo = _unitOfWork.Repository<Attendance>();
            var existingRecord = await attendanceRepo.FirstOrDefaultAsync(a => a.SessionId == request.SessionId && a.UserId == userId);

            if (existingRecord != null && existingRecord.CheckinTime.HasValue)
            {
                throw new BadRequestException("You have already checked in for this session.");
            }

            var now = DateTime.UtcNow;

            // Calculate lateness
            var sessionStartTimeUtc = session.SessionDate.Date.Add(session.StartTime);
            var lateMinutes = 0;

            string statusCode = "PRESENT";
            var lateThreshold = school.SchoolDetail?.LateThresholdMinutes ?? 15;
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

            if (existingRecord == null)
            {
                await attendanceRepo.AddAsync(attendance);
            }
            else
            {
                attendanceRepo.Update(attendance);
            }

            await _unitOfWork.CommitAsync();
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
            var sessionEndTimeUtc = session.SessionDate.Date.Add(session.EndTime);
            var schoolRepo = _unitOfWork.Repository<School>();
            var school = await schoolRepo.FirstOrDefaultAsync(s => s.Id == session.SchoolId, ignoreQueryFilters: true, includeProperties: "SchoolDetail");
            if (school == null) throw new NotFoundException("School", session.SchoolId);

            if (school.SchoolDetail?.Latitude.HasValue == true && school.SchoolDetail?.Longitude.HasValue == true)
            {
                var distance = GeoCalculator.HaversineDistanceInMeters(
                    request.Latitude, request.Longitude, school.SchoolDetail.Latitude.Value, school.SchoolDetail.Longitude.Value);

                if (distance > school.SchoolDetail.AttendanceRadius)
                {
                    throw new BadRequestException($"You are out of the attendance zone for check-out. Distance: {Math.Round(distance)}m, Max allowed: {school.SchoolDetail.AttendanceRadius}m.");
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

            attendanceRepo.Update(record);
            await _unitOfWork.CommitAsync();

            return record.ToDto();
        }

        public async Task<PagedResult<AttendanceDto>> GetMyAttendancesAsync(Guid userId, int pageNumber, int pageSize)
        {
            var repo = _unitOfWork.Repository<Attendance>();
            var result = await repo.FindPagedAsync(a => a.UserId == userId, pageNumber, pageSize);

            return new PagedResult<AttendanceDto>
            {
                Items = result.Items.Select(a => a.ToDto()),
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
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
        }
    }
}
