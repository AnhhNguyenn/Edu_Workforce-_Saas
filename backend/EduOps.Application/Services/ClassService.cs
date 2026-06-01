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

        public ClassService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PagedResult<ClassListResponseDto>> GetClassesAsync(Guid organizationId, GetClassListQueryDto query, Guid? teacherId)
        {
            var repo = _unitOfWork.Repository<Class>();
            
            System.Linq.Expressions.Expression<Func<Class, bool>> predicate = c => 
                c.OrganizationId == organizationId &&
                (!query.SchoolId.HasValue || c.SchoolId == query.SchoolId) &&
                (string.IsNullOrEmpty(query.SearchKeyword) || c.Name.ToLower().Contains(query.SearchKeyword.ToLower()) || (c.Subject != null && c.Subject.ToLower().Contains(query.SearchKeyword.ToLower())));

            // Nếu có teacherId, lọc ra những Class mà teacher đó đang dạy (thông qua ClassSchedule hoặc Session)
            if (teacherId.HasValue)
            {
                var scheduleRepo = _unitOfWork.Repository<ClassSchedule>();
                var sessionRepo = _unitOfWork.Repository<Session>();
                
                var classIdsFromSchedules = (await scheduleRepo.FindAsync(s => s.TeacherId == teacherId.Value && s.Status == AccountStatus.ACTIVE)).Select(s => s.ClassId).Distinct().ToList();
                var classIdsFromSessions = (await sessionRepo.FindAsync(s => s.TeacherId == teacherId.Value && (s.Status == SessionStatus.SCHEDULED || s.Status == SessionStatus.IN_PROGRESS))).Select(s => s.ClassId).Distinct().ToList();
                
                var allTeacherClassIds = classIdsFromSchedules.Concat(classIdsFromSessions).Distinct().ToList();
                
                predicate = c => 
                    c.OrganizationId == organizationId &&
                    (!query.SchoolId.HasValue || c.SchoolId == query.SchoolId) &&
                    (string.IsNullOrEmpty(query.SearchKeyword) || c.Name.ToLower().Contains(query.SearchKeyword.ToLower()) || (c.Subject != null && c.Subject.ToLower().Contains(query.SearchKeyword.ToLower()))) &&
                    allTeacherClassIds.Contains(c.Id);
            }

            var result = await repo.FindPagedAsync(predicate, query.PageNumber, query.PageSize);

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
            var classEntity = await _unitOfWork.Repository<Class>().GetByIdAsync(id);
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", id);

            if (teacherId.HasValue)
            {
                var scheduleRepo = _unitOfWork.Repository<ClassSchedule>();
                var sessionRepo = _unitOfWork.Repository<Session>();
                
                bool isTeaching = await scheduleRepo.AnyAsync(s => s.ClassId == id && s.TeacherId == teacherId.Value && s.Status == AccountStatus.ACTIVE) ||
                                  await sessionRepo.AnyAsync(s => s.ClassId == id && s.TeacherId == teacherId.Value);
                                  
                if (!isTeaching) throw new System.UnauthorizedAccessException("You do not have permission to view this class.");
            }
            return classEntity.ToDetailResponseDto();
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
            var existing = await classRepo.FindAsync(c => c.OrganizationId == organizationId && c.SchoolId == request.SchoolId && c.Name.ToLower() == request.Name.ToLower(), ignoreQueryFilters: true);
            
            if (existing.Any())
                throw new BadRequestException("Tên lớp đã tồn tại trong cơ sở này (bao gồm cả lớp đã xóa).");

            var newClass = new Class
            {
                OrganizationId = organizationId,
                SchoolId = request.SchoolId,
                Name = request.Name,
                Grade = request.Grade,
                Subject = request.Subject,
                Description = request.Description,
                Status = request.Status ?? AccountStatus.ACTIVE
            };

            await _unitOfWork.Repository<Class>().AddAsync(newClass);
            await _unitOfWork.CommitAsync();

            return newClass.ToDetailResponseDto();
        }

        public async Task UpdateAsync(Guid id, Guid organizationId, UpdateClassRequestDto request)
        {
            var classRepo = _unitOfWork.Repository<Class>();
            var classEntity = await classRepo.GetByIdAsync(id);
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
                var existing = await classRepo.FindAsync(c => c.OrganizationId == organizationId && c.SchoolId == request.SchoolId && c.Name.ToLower() == request.Name.ToLower(), ignoreQueryFilters: true);
                if (existing.Any())
                    throw new BadRequestException("Tên lớp đã tồn tại trong cơ sở này (bao gồm cả lớp đã xóa).");
            }



            classEntity.Name = request.Name;
            classEntity.Grade = request.Grade;
            classEntity.Subject = request.Subject;
            classEntity.Description = request.Description;
            
            if (request.Status.HasValue)
            {
                classEntity.Status = request.Status.Value;
            }

            _unitOfWork.Repository<Class>().Update(classEntity);
            await _unitOfWork.CommitAsync();
        }

        public async Task DeleteAsync(Guid id, Guid organizationId)
        {
            var repo = _unitOfWork.Repository<Class>();
            var classEntity = await repo.GetByIdAsync(id);
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", id);

            classEntity.DeletedAt = DateTime.UtcNow;
            classEntity.Status = AccountStatus.INACTIVE;
            repo.Update(classEntity);

            // Cascade Soft Delete: Hủy ClassSchedules
            var scheduleRepo = _unitOfWork.Repository<ClassSchedule>();
            var schedules = await scheduleRepo.FindAsync(s => s.ClassId == id);
            foreach(var schedule in schedules)
            {
                schedule.Status = AccountStatus.INACTIVE;
                schedule.DeletedAt = DateTime.UtcNow;
                scheduleRepo.Update(schedule);
            }

            // Cascade Cancel: Hủy Sessions tương lai
            var sessionRepo = _unitOfWork.Repository<Session>();
            var sessions = await sessionRepo.FindAsync(s => s.ClassId == id && (s.Status == SessionStatus.SCHEDULED || s.Status == SessionStatus.IN_PROGRESS));
            foreach(var session in sessions)
            {
                session.Status = SessionStatus.CANCELLED;
                session.Note = "Lớp học đã bị xóa.";
                sessionRepo.Update(session);
            }

            // Cập nhật trạng thái Enrollments
            var enrollmentRepo = _unitOfWork.Repository<ClassEnrollment>();
            var enrollments = await enrollmentRepo.FindAsync(e => e.ClassId == id && e.Status == "ENROLLED");
            foreach(var enrollment in enrollments)
            {
                enrollment.Status = "COMPLETED"; // hoặc DROPPED_OUT tùy logic, ở đây lấy COMPLETED cho nhẹ nhàng
                enrollmentRepo.Update(enrollment);
            }

            await _unitOfWork.CommitAsync();
        }
    }
}
