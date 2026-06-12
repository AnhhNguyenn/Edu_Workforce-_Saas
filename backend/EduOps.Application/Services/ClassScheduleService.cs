using System;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic.ClassSchedules.Requests;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class ClassScheduleService : IClassScheduleService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ISessionService _sessionService;
        private readonly ICurrentUserService _currentUserService;
        private readonly INotificationService _notificationService;

        public ClassScheduleService(IUnitOfWork unitOfWork, ISessionService sessionService, ICurrentUserService currentUserService, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _sessionService = sessionService;
            _currentUserService = currentUserService;
            _notificationService = notificationService;
        }

        public async Task AddScheduleAsync(Guid classId, Guid organizationId, AddClassScheduleRequestDto request)
        {
            var classRepo = _unitOfWork.Repository<Class>();
            var classEntity = await classRepo.GetByIdAsync(classId);
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", classId);

            var userRepo = _unitOfWork.Repository<User>();
            var teacher = await userRepo.FirstOrDefaultAsync(u => u.Id == request.TeacherId, includeProperties: "Role,Status");
            if (teacher == null || teacher.OrganizationId != organizationId || teacher.Role?.Code != "TEACHER" || teacher.Status?.Code != "ACTIVE")
                throw new BadRequestException("Giáo viên không hợp lệ hoặc đã bị khóa tài khoản.");

            if (request.AssistantId.HasValue)
            {
                var assistant = await userRepo.FirstOrDefaultAsync(u => u.Id == request.AssistantId.Value, includeProperties: "Role,Status");
                if (assistant == null || assistant.OrganizationId != organizationId || assistant.Role?.Code != "ASSISTANT" || assistant.Status?.Code != "ACTIVE")
                    throw new BadRequestException("Trợ giảng không hợp lệ hoặc đã bị khóa tài khoản.");
            }

            var activeStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "ACTIVE");
            var schedule = new ClassSchedule
            {
                OrganizationId = organizationId,
                ClassId = classId,
                DayOfWeek = request.DayOfWeek == System.DayOfWeek.Sunday ? 7 : (int)request.DayOfWeek,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                TeacherId = request.TeacherId,
                AssistantId = request.AssistantId,
                StatusId = activeStatus?.Id
            };

            await _unitOfWork.Repository<ClassSchedule>().AddAsync(schedule);
            await _unitOfWork.CommitAsync();

            await _notificationService.CreateAndSendAsync(
                request.TeacherId,
                "Phân công giảng dạy",
                $"Bạn đã được phân công dạy lịch cố định mới cho lớp {classEntity.Name}.",
                "SYSTEM"
            );

            if (request.AssistantId.HasValue)
            {
                await _notificationService.CreateAndSendAsync(
                    request.AssistantId.Value,
                    "Phân công trợ giảng",
                    $"Bạn đã được phân công làm trợ giảng lịch cố định mới cho lớp {classEntity.Name}.",
                    "SYSTEM"
                );
            }
        }

        public async Task EnrollStudentAsync(Guid classId, Guid organizationId, EnrollStudentRequestDto request)
        {
            var classRepo = _unitOfWork.Repository<Class>();
            var classEntity = await classRepo.GetByIdAsync(classId);
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", classId);

            var studentRepo = _unitOfWork.Repository<Student>();
            var student = await studentRepo.FirstOrDefaultAsync(s => s.Id == request.StudentId, includeProperties: "Status");
            if (student == null || student.OrganizationId != organizationId)
                throw new NotFoundException("Student", request.StudentId);

            if (student.Status?.Code != "ACTIVE")
                throw new BadRequestException("Không thể ghi danh học viên đang bảo lưu hoặc đã nghỉ học.");

            var enrollmentRepo = _unitOfWork.Repository<ClassEnrollment>();
            var exists = await enrollmentRepo.AnyAsync(e => e.ClassId == classId && e.StudentId == request.StudentId && e.Status != null && e.Status.Code == "ENROLLED");

            if (exists)
                throw new BadRequestException("Học viên đã được ghi danh vào lớp này.");

            var enrolledStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.EnrollmentStatus>().FirstOrDefaultAsync(s => s.Code == "ENROLLED");
            var enrollment = new ClassEnrollment
            {
                OrganizationId = organizationId,
                ClassId = classId,
                StudentId = request.StudentId,
                EnrollmentDate = DateTime.UtcNow,
                StatusId = enrolledStatus?.Id
            };

            await enrollmentRepo.AddAsync(enrollment);
            await _unitOfWork.CommitAsync();

            if (_currentUserService.UserId != Guid.Empty)
            {
                await _notificationService.CreateAndSendAsync(
                    _currentUserService.UserId,
                    "Hệ thống",
                    $"Đã ghi danh học viên {student.FullName} vào lớp {classEntity.Name} thành công.",
                    "SYSTEM"
                );
            }
        }

        public async Task GenerateSessionsAsync(Guid classId, Guid organizationId, GenerateSessionsRequestDto request)
        {
            var classRepo = _unitOfWork.Repository<Class>();
            var scheduleRepo = _unitOfWork.Repository<ClassSchedule>();
            var sessionRepo = _unitOfWork.Repository<Session>();

            var classEntity = await classRepo.GetByIdAsync(classId);
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", classId);

            var schedules = await scheduleRepo.FindAsync(s => s.ClassId == classId && s.Status != null && s.Status.Code == "ACTIVE");
            if (!schedules.Any())
                throw new BadRequestException("Lớp học chưa có lịch cố định nào để sinh buổi học.");

            for (DateTime date = request.FromDate.Date; date <= request.ToDate.Date; date = date.AddDays(1))
            {
                int dayOfWeek = date.DayOfWeek == DayOfWeek.Sunday ? 7 : (int)date.DayOfWeek;

                var matchedSchedules = schedules.Where(s => s.DayOfWeek == dayOfWeek);

                foreach (var schedule in matchedSchedules)
                {
                    // Check if already generated
                    var exists = await sessionRepo.AnyAsync(s =>
                        s.ClassId == classId &&
                        s.SessionDate.Date == date &&
                        s.StartTime == schedule.StartTime);

                    if (!exists)
                    {
                        await _sessionService.CheckConflictAsync(organizationId, schedule.TeacherId, schedule.AssistantId, date, schedule.StartTime, schedule.EndTime);

                        var scheduledStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.SessionStatus>().FirstOrDefaultAsync(s => s.Code == "SCHEDULED");
                        var session = new Session
                        {
                            OrganizationId = organizationId,
                            ClassId = classId,
                            ClassScheduleId = schedule.Id,
                            SchoolId = classEntity.SchoolId,
                            TeacherId = schedule.TeacherId,
                            AssistantId = schedule.AssistantId,
                            LessonTitle = $"Buổi học {date:dd/MM/yyyy}",
                            SessionDate = date,
                            StartTime = schedule.StartTime,
                            EndTime = schedule.EndTime,
                            StatusId = scheduledStatus?.Id
                        };
                        await sessionRepo.AddAsync(session);
                    }
                }
            }
            await _unitOfWork.CommitAsync();

            var uniqueTeachers = schedules.Select(s => s.TeacherId).Distinct();
            foreach (var tId in uniqueTeachers)
            {
                await _notificationService.CreateAndSendAsync(
                    tId,
                    "Lịch học tự động",
                    $"Hệ thống đã tự động sinh lịch học chi tiết cho lớp {classEntity.Name} từ ngày {request.FromDate:dd/MM} đến {request.ToDate:dd/MM}.",
                    "SYSTEM"
                );
            }

            var uniqueAssistants = schedules.Where(s => s.AssistantId.HasValue).Select(s => s.AssistantId!.Value).Distinct();
            foreach (var aId in uniqueAssistants)
            {
                await _notificationService.CreateAndSendAsync(
                    aId,
                    "Lịch học tự động",
                    $"Hệ thống đã tự động sinh lịch học chi tiết (trợ giảng) cho lớp {classEntity.Name} từ ngày {request.FromDate:dd/MM} đến {request.ToDate:dd/MM}.",
                    "SYSTEM"
                );
            }
        }
    }
}
