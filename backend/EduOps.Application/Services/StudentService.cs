using System;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic.Students.Requests;
using EduOps.Application.DTOs.Academic.Students.Responses;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class StudentService : IStudentService
    {
        private readonly IUnitOfWork _unitOfWork;

        public StudentService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PagedResult<StudentListResponseDto>> GetStudentsAsync(Guid organizationId, GetStudentListQueryDto query)
        {
            var repo = _unitOfWork.Repository<Student>();

            System.Linq.Expressions.Expression<Func<Student, bool>> predicate = s =>
                s.OrganizationId == organizationId &&
                (string.IsNullOrEmpty(query.SearchKeyword) || s.FullName.ToLower().Contains(query.SearchKeyword.ToLower()) || s.StudentCode.ToLower().Contains(query.SearchKeyword.ToLower()) || (s.StudentDetail != null && s.StudentDetail.ParentPhone != null && s.StudentDetail.ParentPhone.ToLower().Contains(query.SearchKeyword.ToLower())));

            var result = await repo.FindPagedAsync(predicate, query.PageNumber, query.PageSize, includeProperties: "Status");

            return new PagedResult<StudentListResponseDto>
            {
                Items = result.Items.Select(s => s.ToListResponseDto()),
                TotalCount = result.TotalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };
        }

        public async Task<StudentDetailResponseDto> GetByIdAsync(Guid id, Guid organizationId)
        {
            var student = await _unitOfWork.Repository<Student>().FirstOrDefaultAsync(s => s.Id == id, includeProperties: "Status,StudentDetail");
            if (student == null || student.OrganizationId != organizationId)
                throw new NotFoundException("Student", id);

            return student.ToDetailResponseDto();
        }

        public async Task<StudentDetailResponseDto> CreateAsync(Guid organizationId, CreateStudentRequestDto request)
        {
            var repo = _unitOfWork.Repository<Student>();

            request.StudentCode = request.StudentCode.Trim();
            request.FullName = request.FullName.Trim();
            if (request.ParentName != null) request.ParentName = request.ParentName.Trim();
            if (request.ParentPhone != null) request.ParentPhone = request.ParentPhone.Trim();
            if (request.ParentEmail != null) request.ParentEmail = request.ParentEmail.Trim();

            var existing = await repo.AnyAsync(s => s.OrganizationId == organizationId && s.StudentCode == request.StudentCode, ignoreQueryFilters: true);
            if (existing)
                throw new BadRequestException("Mã học viên đã tồn tại trong hệ thống (bao gồm cả học viên đã nghỉ học).");

            var activeStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "ACTIVE");
            var student = new Student
            {
                OrganizationId = organizationId,
                FullName = request.FullName,
                StudentCode = request.StudentCode,
                StudentDetail = new EduOps.Domain.Entities.StudentDetail
                {
                    BirthDate = request.BirthDate,
                    ParentName = request.ParentName ?? "",
                    ParentPhone = request.ParentPhone ?? "",
                    ParentEmail = request.ParentEmail ?? ""
                },
                StatusId = activeStatus?.Id
            };

            await repo.AddAsync(student);
            await _unitOfWork.CommitAsync();

            return student.ToDetailResponseDto();
        }

        public async Task UpdateAsync(Guid id, Guid organizationId, UpdateStudentRequestDto request)
        {
            var repo = _unitOfWork.Repository<Student>();
            var student = await repo.GetByIdAsync(id);
            if (student == null || student.OrganizationId != organizationId)
                throw new NotFoundException("Student", id);

            request.FullName = request.FullName.Trim();
            if (request.ParentName != null) request.ParentName = request.ParentName.Trim();
            if (request.ParentPhone != null) request.ParentPhone = request.ParentPhone.Trim();
            if (request.ParentEmail != null) request.ParentEmail = request.ParentEmail.Trim();
            student.FullName = request.FullName;
            // StudentCode is immutable, omitted from update
            if (student.StudentDetail == null) student.StudentDetail = new EduOps.Domain.Entities.StudentDetail();
            student.StudentDetail.BirthDate = request.BirthDate;
            student.StudentDetail.ParentName = request.ParentName ?? "";
            student.StudentDetail.ParentPhone = request.ParentPhone ?? "";
            student.StudentDetail.ParentEmail = request.ParentEmail ?? "";

            // student.Status = request.Status;

            repo.Update(student);
            await _unitOfWork.CommitAsync();
        }

        public async Task DeleteAsync(Guid id, Guid organizationId)
        {
            var repo = _unitOfWork.Repository<Student>();
            var student = await repo.GetByIdAsync(id);
            if (student == null || student.OrganizationId != organizationId)
                throw new NotFoundException("Student", id);

            student.DeletedAt = DateTime.UtcNow;
            var inactiveStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "INACTIVE");
            student.StatusId = inactiveStatus?.Id;
            repo.Update(student);
            await _unitOfWork.CommitAsync();
        }
    }
}
