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

        public ClassScheduleService(IUnitOfWork unitOfWork, ISessionService sessionService)
        {
            _unitOfWork = unitOfWork;
            _sessionService = sessionService;
        }

        public async Task AddScheduleAsync(Guid classId, Guid organizationId, AddClassScheduleRequestDto request)
        {
            var classRepo = _unitOfWork.Repository<Class>();
            var classEntity = await classRepo.GetByIdAsync(classId);
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", classId);

            var userRepo = _unitOfWork.Repository<User>();
            var teacher = await userRepo.GetByIdAsync(request.TeacherId);
            if (teacher == null || teacher.OrganizationId != organizationId || teacher.Role != "TEACHER" || teacher.Status != "ACTIVE")
                throw new BadRequestException("Giáo viên không hợp lệ hoặc đã bị khóa tài khoản.");

            if (request.AssistantId.HasValue)
            {
                var assistant = await userRepo.GetByIdAsync(request.AssistantId.Value);
                if (assistant == null || assistant.OrganizationId != organizationId || assistant.Role != "ASSISTANT" || assistant.Status != "ACTIVE")
                    throw new BadRequestException("Trợ giảng không hợp lệ hoặc đã bị khóa tài khoản.");
            }

            var schedule = new ClassSchedule
            {
                OrganizationId = organizationId,
                ClassId = classId,
                DayOfWeek = request.DayOfWeek == System.DayOfWeek.Sunday ? 7 : (int)request.DayOfWeek,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                TeacherId = request.TeacherId,
                AssistantId = request.AssistantId,
                Status = AccountStatus.ACTIVE
            };

            await _unitOfWork.Repository<ClassSchedule>().AddAsync(schedule);
            await _unitOfWork.CommitAsync();
        }

        public async Task EnrollStudentAsync(Guid classId, Guid organizationId, EnrollStudentRequestDto request)
        {
            var classRepo = _unitOfWork.Repository<Class>();
            var classEntity = await classRepo.GetByIdAsync(classId);
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", classId);

            var studentRepo = _unitOfWork.Repository<Student>();
            var student = await studentRepo.GetByIdAsync(request.StudentId);
            if (student == null || student.OrganizationId != organizationId)
                throw new NotFoundException("Student", request.StudentId);

            if (student.Status != AccountStatus.ACTIVE)
                throw new BadRequestException("Không thể ghi danh học viên đang bảo lưu hoặc đã nghỉ học.");

            var enrollmentRepo = _unitOfWork.Repository<ClassEnrollment>();
            var exists = await enrollmentRepo.AnyAsync(e => e.ClassId == classId && e.StudentId == request.StudentId && e.Status == "ENROLLED");
            
            if (exists)
                throw new BadRequestException("Học viên đã được ghi danh vào lớp này.");

            var enrollment = new ClassEnrollment
            {
                OrganizationId = organizationId,
                ClassId = classId,
                StudentId = request.StudentId,
                EnrollmentDate = DateTime.UtcNow,
                Status = "ENROLLED"
            };

            await enrollmentRepo.AddAsync(enrollment);
            await _unitOfWork.CommitAsync();
        }

        public async Task GenerateSessionsAsync(Guid classId, Guid organizationId, GenerateSessionsRequestDto request)
        {
            var classRepo = _unitOfWork.Repository<Class>();
            var scheduleRepo = _unitOfWork.Repository<ClassSchedule>();
            var sessionRepo = _unitOfWork.Repository<Session>();

            var classEntity = await classRepo.GetByIdAsync(classId);
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", classId);

            var schedules = await scheduleRepo.FindAsync(s => s.ClassId == classId && s.Status == AccountStatus.ACTIVE);
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
                            Status = SessionStatus.SCHEDULED
                        };
                        await sessionRepo.AddAsync(session);
                    }
                }
            }
            await _unitOfWork.CommitAsync();
        }
    }
}
