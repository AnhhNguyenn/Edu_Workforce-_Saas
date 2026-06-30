using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic.Classes.Requests;
using EduOps.Application.DTOs.Academic.Classes.Responses;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class ClassService : IClassService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly INotificationService _notificationService;
        private readonly IRealtimeNotificationService _realtimeNotification;

        public ClassService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, INotificationService notificationService, IRealtimeNotificationService realtimeNotification)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _notificationService = notificationService;
            _realtimeNotification = realtimeNotification;
        }

        public async Task<PagedResult<ClassListResponseDto>> GetClassesAsync(Guid organizationId, GetClassListQueryDto query, Guid? teacherId)
        {
            var repo = _unitOfWork.Repository<Class>();

            System.Linq.Expressions.Expression<Func<Class, bool>> predicate = c =>
                c.OrganizationId == organizationId &&
                (!query.SchoolId.HasValue || c.SchoolId == query.SchoolId) &&
                (string.IsNullOrEmpty(query.AcademicYear) || c.AcademicYear == query.AcademicYear) &&
                (string.IsNullOrEmpty(query.SearchKeyword) || c.Name.ToLower().Contains(query.SearchKeyword.ToLower()) || (c.Subject != null && c.Subject.Code.ToLower().Contains(query.SearchKeyword.ToLower())));

            // Nếu có teacherId, lọc ra những Class mà teacher đó đang dạy (thông qua ClassSchedule hoặc Session)
            if (teacherId.HasValue)
            {
                var scheduleRepo = _unitOfWork.Repository<ClassSchedule>();
                var sessionRepo = _unitOfWork.Repository<Session>();

                var classIdsFromSchedules = (await scheduleRepo.FindAsync(s => s.TeacherId == teacherId.Value && s.Status != null && s.Status.Code == "ACTIVE")).Select(s => s.ClassId).Distinct().ToList();
                var classIdsFromSessions = (await sessionRepo.FindAsync(s => s.TeacherId == teacherId.Value && s.Status != null && (s.Status.Code == "SCHEDULED" || s.Status.Code == "IN_PROGRESS"))).Select(s => s.ClassId).Distinct().ToList();

                var allTeacherClassIds = classIdsFromSchedules.Concat(classIdsFromSessions).Distinct().ToList();

                predicate = c =>
                    c.OrganizationId == organizationId &&
                    (!query.SchoolId.HasValue || c.SchoolId == query.SchoolId) &&
                    (string.IsNullOrEmpty(query.AcademicYear) || c.AcademicYear == query.AcademicYear) &&
                    (string.IsNullOrEmpty(query.SearchKeyword) || c.Name.ToLower().Contains(query.SearchKeyword.ToLower()) || (c.Subject != null && c.Subject.Code.ToLower().Contains(query.SearchKeyword.ToLower()))) &&
                    allTeacherClassIds.Contains(c.Id);
            }

            var result = await repo.FindPagedAsync(predicate, query.PageNumber, query.PageSize, includeProperties: "School,Grade,Subject,Status,Enrollments,Enrollments.Status");

            return new PagedResult<ClassListResponseDto>
            {
                Items = result.Items.Select(c => c.ToListResponseDto()),
                TotalCount = result.TotalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };
        }

        public async Task<ClassDetailResponseDto> GetByIdAsync(Guid id, Guid organizationId, Guid? teacherId = null)
        {
            var classEntity = await _unitOfWork.Repository<Class>().FirstOrDefaultAsync(c => c.Id == id, includeProperties: "School,Grade,Subject,Status,ClassDetail");
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", id);

            if (teacherId.HasValue)
            {
                var scheduleRepo = _unitOfWork.Repository<ClassSchedule>();
                var sessionRepo = _unitOfWork.Repository<Session>();

                bool isTeaching = await scheduleRepo.AnyAsync(s => s.ClassId == id && s.TeacherId == teacherId.Value && s.Status != null && s.Status.Code == "ACTIVE") ||
                                  await sessionRepo.AnyAsync(s => s.ClassId == id && s.TeacherId == teacherId.Value);

                if (!isTeaching) throw new System.UnauthorizedAccessException("You do not have permission to view this class.");
            }
            return classEntity.ToDetailResponseDto();
        }

        public async Task<List<EduOps.Application.DTOs.Academic.Students.Responses.StudentListResponseDto>> GetClassStudentsAsync(Guid classId, Guid organizationId)
        {
            var enrollmentRepo = _unitOfWork.Repository<ClassEnrollment>();
            
            // Get active enrollments for this class
            var enrollments = await enrollmentRepo.FindAsync(
                e => e.ClassId == classId && e.OrganizationId == organizationId && e.Status != null && e.Status.Code == "ENROLLED"
            );

            var studentIds = enrollments.Select(e => e.StudentId).ToList();
            if (!studentIds.Any()) return new List<EduOps.Application.DTOs.Academic.Students.Responses.StudentListResponseDto>();

            var studentRepo = _unitOfWork.Repository<Student>();
            var students = await studentRepo.FindAsync(
                s => studentIds.Contains(s.Id),
                includeProperties: "Status,StudentDetail"
            );

            return students.Select(s => s.ToListResponseDto()).ToList();
        }

        public async Task<ClassDetailResponseDto> CreateAsync(Guid organizationId, CreateClassRequestDto request)
        {
            var schoolRepo = _unitOfWork.Repository<School>();
            var school = await schoolRepo.GetByIdAsync(request.SchoolId);

            if (school == null || school.OrganizationId != organizationId)
                throw new BadRequestException("Invalid School ID");

            request.Name = request.Name.Trim();
            if (request.Grade != null) request.Grade = request.Grade.Trim();
            if (request.Subject != null) request.Subject = request.Subject.Trim();
            if (request.Description != null) request.Description = request.Description.Trim();

            var classRepo = _unitOfWork.Repository<Class>();
            var existing = await classRepo.AnyAsync(c => c.OrganizationId == organizationId && c.SchoolId == request.SchoolId && c.Name.ToLower() == request.Name.ToLower(), ignoreQueryFilters: true);

            if (existing)
                throw new BadRequestException("Tên lớp đã tồn tại trong cơ sở này (bao gồm cả lớp đã xóa).");

            var grade = string.IsNullOrEmpty(request.Grade) ? null : await _unitOfWork.Repository<EduOps.Domain.Entities.Grade>().FirstOrDefaultAsync(g => g.Code == request.Grade);
            var subject = string.IsNullOrEmpty(request.Subject) ? null : await _unitOfWork.Repository<EduOps.Domain.Entities.Subject>().FirstOrDefaultAsync(s => s.Code == request.Subject);
            var activeStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "ACTIVE");

            var newClass = new Class
            {
                OrganizationId = organizationId,
                SchoolId = request.SchoolId,
                Name = request.Name,
                GradeId = grade?.Id,
                SubjectId = subject?.Id,
                AcademicYear = request.AcademicYear,
                ClassDetail = new ClassDetail { Description = request.Description },
                StatusId = activeStatus?.Id
            };

            await _unitOfWork.Repository<Class>().AddAsync(newClass);
            await _unitOfWork.CommitAsync();

            if (_currentUserService.UserId != Guid.Empty)
            {
                await _notificationService.CreateAndSendAsync(
                    _currentUserService.UserId,
                    "Hệ thống",
                    $"Bạn đã tạo thành công lớp học mới: {newClass.Name}",
                    "SYSTEM"
                );
            }

            await _realtimeNotification.SendToOrganizationAsync(organizationId, "ClassUpdated");

            return newClass.ToDetailResponseDto();
        }

        public async Task UpdateAsync(Guid id, Guid organizationId, UpdateClassRequestDto request)
        {
            var classRepo = _unitOfWork.Repository<Class>();
            var classEntity = await classRepo.FirstOrDefaultAsync(c => c.Id == id, includeProperties: "ClassDetail");
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", id);

            if (classEntity.SchoolId != request.SchoolId)
            {
                throw new BadRequestException("Không được phép thay đổi Cơ sở của lớp học sau khi tạo để tránh sai lệch dữ liệu điểm danh GPS.");
            }

            request.Name = request.Name.Trim();
            if (request.Grade != null) request.Grade = request.Grade.Trim();
            if (request.Subject != null) request.Subject = request.Subject.Trim();
            if (request.Description != null) request.Description = request.Description.Trim();

            if (classEntity.Name.ToLower() != request.Name.ToLower())
            {
                var existing = await classRepo.AnyAsync(c => c.OrganizationId == organizationId && c.SchoolId == request.SchoolId && c.Name.ToLower() == request.Name.ToLower(), ignoreQueryFilters: true);
                if (existing)
                    throw new BadRequestException("Tên lớp đã tồn tại trong cơ sở này (bao gồm cả lớp đã xóa).");
            }



            var grade = string.IsNullOrEmpty(request.Grade) ? null : await _unitOfWork.Repository<EduOps.Domain.Entities.Grade>().FirstOrDefaultAsync(g => g.Code == request.Grade);
            var subject = string.IsNullOrEmpty(request.Subject) ? null : await _unitOfWork.Repository<EduOps.Domain.Entities.Subject>().FirstOrDefaultAsync(s => s.Code == request.Subject);
            
            if (!string.IsNullOrEmpty(request.StatusCode))
            {
                var status = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == request.StatusCode);
                if (status != null)
                {
                    classEntity.StatusId = status.Id;
                }
            }

            classEntity.Name = request.Name;
            classEntity.GradeId = grade?.Id;
            classEntity.SubjectId = subject?.Id;
            classEntity.AcademicYear = request.AcademicYear;
            
            if (classEntity.ClassDetail == null)
            {
                classEntity.ClassDetail = new ClassDetail { ClassId = classEntity.Id };
                await _unitOfWork.Repository<ClassDetail>().AddAsync(classEntity.ClassDetail);
            }
            classEntity.ClassDetail.Description = request.Description;
            _unitOfWork.Repository<ClassDetail>().Update(classEntity.ClassDetail);

            _unitOfWork.Repository<Class>().Update(classEntity);
            await _unitOfWork.CommitAsync();

            if (_currentUserService.UserId != Guid.Empty)
            {
                await _notificationService.CreateAndSendAsync(
                    _currentUserService.UserId,
                    "Hệ thống",
                    $"Bạn đã cập nhật thành công lớp học: {classEntity.Name}",
                    "SYSTEM"
                );
            }

            await _realtimeNotification.SendToOrganizationAsync(organizationId, "ClassUpdated");
        }

        public async Task DeleteAsync(Guid id, Guid organizationId)
        {
            var repo = _unitOfWork.Repository<Class>();
            var classEntity = await repo.GetByIdAsync(id);
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", id);

            classEntity.DeletedAt = DateTime.UtcNow;
            var inactiveStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "INACTIVE");
            classEntity.StatusId = inactiveStatus?.Id;
            repo.Update(classEntity);

            // Cascade Soft Delete: Hủy ClassSchedules
            var scheduleRepo = _unitOfWork.Repository<ClassSchedule>();
            var schedules = await scheduleRepo.FindAsync(s => s.ClassId == id);
            foreach (var schedule in schedules)
            {
                schedule.StatusId = inactiveStatus?.Id;
                schedule.DeletedAt = DateTime.UtcNow;
                scheduleRepo.Update(schedule);
            }

            // Cascade Cancel: Hủy Sessions tương lai
            var sessionRepo = _unitOfWork.Repository<Session>();
            var sessions = await sessionRepo.FindAsync(
                s => s.ClassId == id && s.Status != null && (s.Status.Code == "SCHEDULED" || s.Status.Code == "IN_PROGRESS"),
                includeProperties: "SessionDetail");
            var cancelledStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.SessionStatus>().FirstOrDefaultAsync(s => s.Code == "CANCELLED");
            foreach (var session in sessions)
            {
                session.StatusId = cancelledStatus?.Id;
                if (session.SessionDetail == null)
                {
                    session.SessionDetail = new SessionDetail { SessionId = session.Id };
                    await _unitOfWork.Repository<SessionDetail>().AddAsync(session.SessionDetail);
                }
                session.SessionDetail.Note = "Lớp học đã bị xóa.";
                _unitOfWork.Repository<SessionDetail>().Update(session.SessionDetail);
                sessionRepo.Update(session);
            }

            // Cập nhật trạng thái Enrollments
            var enrollmentRepo = _unitOfWork.Repository<ClassEnrollment>();
            var enrollments = await enrollmentRepo.FindAsync(e => e.ClassId == id && e.Status != null && e.Status.Code == "ENROLLED");
            var completedStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.EnrollmentStatus>().FirstOrDefaultAsync(s => s.Code == "COMPLETED");
            foreach (var enrollment in enrollments)
            {
                enrollment.StatusId = completedStatus?.Id; // hoặc DROPPED_OUT tùy logic, ở đây lấy COMPLETED cho nhẹ nhàng
                enrollmentRepo.Update(enrollment);
            }

            await _unitOfWork.CommitAsync();
            await _realtimeNotification.SendToOrganizationAsync(organizationId, "ClassUpdated");
        }
    }
}
