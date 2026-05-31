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
            var session = (await sessionRepo.FindAsync(s => s.Id == request.SessionId)).FirstOrDefault();
            if (session == null) throw new NotFoundException("Session", request.SessionId);
            
            if (session.TeacherId != userId && session.AssistantId != userId)
            {
                throw new ForbiddenException("You are not assigned to this session.");
            }

            var schoolRepo = _unitOfWork.Repository<School>();
            var school = (await schoolRepo.FindAsync(s => s.Id == session.SchoolId, ignoreQueryFilters: true)).FirstOrDefault();
            if (school == null) throw new NotFoundException("School", session.SchoolId);

            if (school.Latitude.HasValue && school.Longitude.HasValue)
            {
                var distance = GeoCalculator.HaversineDistanceInMeters(
                    request.Latitude, request.Longitude, school.Latitude.Value, school.Longitude.Value);

                if (distance > school.AttendanceRadius)
                {
                    throw new BadRequestException($"You are out of the attendance zone. Distance: {Math.Round(distance)}m, Max allowed: {school.AttendanceRadius}m.");
                }
            }

            var attendanceRepo = _unitOfWork.Repository<Attendance>();
            var existingRecord = (await attendanceRepo.FindAsync(a => a.SessionId == request.SessionId && a.UserId == userId)).FirstOrDefault();

            if (existingRecord != null && existingRecord.CheckinTime.HasValue)
            {
                throw new BadRequestException("You have already checked in for this session.");
            }

            var now = DateTime.UtcNow;
            
            // Calculate lateness
            var sessionStartTimeUtc = session.SessionDate.Date.Add(session.StartTime);
            var lateMinutes = 0;
            var status = EduOps.Domain.Enums.AttendanceStatus.PRESENT;

            if (now > sessionStartTimeUtc.AddMinutes(school.LateThresholdMinutes))
            {
                lateMinutes = (int)(now - sessionStartTimeUtc).TotalMinutes;
                status = EduOps.Domain.Enums.AttendanceStatus.LATE;
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
            attendance.Status = status;
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
            var record = (await attendanceRepo.FindAsync(a => a.SessionId == request.SessionId && a.UserId == userId)).FirstOrDefault();

            if (record == null || !record.CheckinTime.HasValue)
            {
                throw new BadRequestException("You must check in before checking out.");
            }

            if (record.CheckoutTime.HasValue)
            {
                throw new BadRequestException("You have already checked out.");
            }

            var sessionRepo = _unitOfWork.Repository<Session>();
            var session = (await sessionRepo.FindAsync(s => s.Id == request.SessionId, ignoreQueryFilters: true)).FirstOrDefault();
            if (session == null) throw new NotFoundException("Session", request.SessionId);

            var now = DateTime.UtcNow;
            var sessionEndTimeUtc = session.SessionDate.Date.Add(session.EndTime);
            var schoolRepo = _unitOfWork.Repository<School>();
            var school = (await schoolRepo.FindAsync(s => s.Id == session.SchoolId, ignoreQueryFilters: true)).FirstOrDefault();
            if (school == null) throw new NotFoundException("School", session.SchoolId);

            if (school.Latitude.HasValue && school.Longitude.HasValue)
            {
                var distance = GeoCalculator.HaversineDistanceInMeters(
                    request.Latitude, request.Longitude, school.Latitude.Value, school.Longitude.Value);

                if (distance > school.AttendanceRadius)
                {
                    throw new BadRequestException($"You are out of the attendance zone for check-out. Distance: {Math.Round(distance)}m, Max allowed: {school.AttendanceRadius}m.");
                }
            }

            var earlyMinutes = 0;
            if (now < sessionEndTimeUtc.AddMinutes(-school.EarlyCheckoutMinutes))
            {
                earlyMinutes = (int)(sessionEndTimeUtc - now).TotalMinutes;
                record.Status = record.Status == EduOps.Domain.Enums.AttendanceStatus.LATE ? EduOps.Domain.Enums.AttendanceStatus.LATE_AND_EARLY : EduOps.Domain.Enums.AttendanceStatus.EARLY_CHECKOUT;
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

        public async Task SubmitStudentAttendancesAsync(Guid sessionId, Guid organizationId, Guid userId, StudentAttendanceSubmitDto request)
        {
            var sessionRepo = _unitOfWork.Repository<Session>();
            var session = (await sessionRepo.FindAsync(s => s.Id == sessionId)).FirstOrDefault();
            
            if (session == null || session.OrganizationId != organizationId) 
                throw new NotFoundException("Session", sessionId);
                
            if (session.TeacherId != userId && session.AssistantId != userId)
            {
                // Only assigned teachers/assistants can mark attendance
                throw new ForbiddenException("You are not assigned to this session.");
            }

            var classEnrollmentRepo = _unitOfWork.Repository<ClassEnrollment>();
            var enrollments = await classEnrollmentRepo.FindAsync(e => e.ClassId == session.ClassId && e.Status == "ENROLLED");
            var enrolledStudentIds = enrollments.Select(e => e.StudentId).ToHashSet();

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
                    existing.Status = record.IsPresent ? EduOps.Domain.Enums.AttendanceStatus.PRESENT : EduOps.Domain.Enums.AttendanceStatus.ABSENT;
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
                        Status = record.IsPresent ? EduOps.Domain.Enums.AttendanceStatus.PRESENT : EduOps.Domain.Enums.AttendanceStatus.ABSENT,
                        Note = record.Note
                    };
                    await studentAttendanceRepo.AddAsync(newAttendance);
                }
            }

            await _unitOfWork.CommitAsync();
        }
    }
}
