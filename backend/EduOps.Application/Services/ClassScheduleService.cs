using System;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic;
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

        public ClassScheduleService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task AddScheduleAsync(Guid classId, Guid organizationId, ClassScheduleRequestDto request)
        {
            var classRepo = _unitOfWork.Repository<Class>();
            var classEntity = await classRepo.GetByIdAsync(classId);
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", classId);

            var userRepo = _unitOfWork.Repository<User>();
            var teacher = await userRepo.GetByIdAsync(request.TeacherId);
            if (teacher == null || teacher.OrganizationId != organizationId || teacher.Status != "ACTIVE")
                throw new BadRequestException("Giáo viên không tồn tại hoặc đã bị khóa tài khoản.");

            if (request.AssistantId.HasValue)
            {
                var assistant = await userRepo.GetByIdAsync(request.AssistantId.Value);
                if (assistant == null || assistant.OrganizationId != organizationId || assistant.Status != "ACTIVE")
                    throw new BadRequestException("Trợ giảng không tồn tại hoặc đã bị khóa tài khoản.");
            }

            var schedule = new ClassSchedule
            {
                OrganizationId = organizationId,
                ClassId = classId,
                DayOfWeek = request.DayOfWeek,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                TeacherId = request.TeacherId,
                AssistantId = request.AssistantId,
                Status = AccountStatus.ACTIVE
            };

            await _unitOfWork.Repository<ClassSchedule>().AddAsync(schedule);
            await _unitOfWork.CommitAsync();
        }

        public async Task EnrollStudentAsync(Guid classId, Guid organizationId, ClassEnrollmentRequestDto request)
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
            var existing = await enrollmentRepo.FindAsync(e => e.ClassId == classId && e.StudentId == request.StudentId);
            
            if (existing.Any())
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

        public async Task GenerateSessionsAsync(Guid classId, Guid organizationId, DateTime fromDate, DateTime toDate)
        {
            var classRepo = _unitOfWork.Repository<Class>();
            var classEntity = await classRepo.GetByIdAsync(classId);
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", classId);

            var scheduleRepo = _unitOfWork.Repository<ClassSchedule>();
            var schedules = await scheduleRepo.FindAsync(s => s.ClassId == classId && s.Status == AccountStatus.ACTIVE);

            var sessionRepo = _unitOfWork.Repository<Session>();
            
            for (var date = fromDate.Date; date <= toDate.Date; date = date.AddDays(1))
            {
                int dayOfWeek = date.DayOfWeek == DayOfWeek.Sunday ? 7 : (int)date.DayOfWeek;
                
                var matchedSchedules = schedules.Where(s => s.DayOfWeek == dayOfWeek);
                
                foreach (var schedule in matchedSchedules)
                {
                    // Check if already generated for this exact class and schedule
                    var existing = await sessionRepo.FindAsync(s => 
                        s.ClassId == classId && 
                        s.SessionDate.Date == date && 
                        s.StartTime == schedule.StartTime);
                        
                    if (existing.Any())
                    {
                        continue; // Skip silently if we already generated this exact session
                    }

                    var requestUsers = new System.Collections.Generic.List<Guid> { schedule.TeacherId };
                    if (schedule.AssistantId.HasValue) requestUsers.Add(schedule.AssistantId.Value);

                    var conflicts = await sessionRepo.FindAsync(s => 
                        s.OrganizationId == organizationId &&
                        s.SessionDate.Date == date &&
                        s.Status != SessionStatus.CANCELLED &&
                        (requestUsers.Contains(s.TeacherId) || (s.AssistantId.HasValue && requestUsers.Contains(s.AssistantId.Value)))
                    );

                    var overlapping = conflicts.FirstOrDefault(s => 
                        (schedule.StartTime >= s.StartTime && schedule.StartTime < s.EndTime) || 
                        (schedule.EndTime > s.StartTime && schedule.EndTime <= s.EndTime) ||
                        (schedule.StartTime <= s.StartTime && schedule.EndTime >= s.EndTime)
                    );

                    if (overlapping != null)
                    {
                        throw new BadRequestException($"Phát hiện trùng lịch tự động: Giáo viên hoặc Trợ giảng đã có lịch ở một ca khác vào ngày {date:dd/MM/yyyy} lúc {schedule.StartTime}. Vui lòng kiểm tra lại lịch định kỳ.");
                    }

                    var session = new Session
                    {
                        OrganizationId = organizationId,
                        ClassId = classId,
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
            await _unitOfWork.CommitAsync();
        }
    }
}
