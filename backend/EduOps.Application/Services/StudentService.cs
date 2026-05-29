using System;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic;
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

        public async Task<PagedResult<StudentDto>> GetStudentsAsync(Guid organizationId, int pageNumber, int pageSize, string? searchKeyword = null)
        {
            var repo = _unitOfWork.Repository<Student>();
            
            System.Linq.Expressions.Expression<Func<Student, bool>> predicate = s => 
                s.OrganizationId == organizationId &&
                (string.IsNullOrEmpty(searchKeyword) || s.FullName.Contains(searchKeyword) || s.StudentCode.Contains(searchKeyword) || (s.ParentPhone != null && s.ParentPhone.Contains(searchKeyword)));

            var result = await repo.FindPagedAsync(predicate, pageNumber, pageSize);

            return new PagedResult<StudentDto>
            {
                Items = result.Items.Select(s => s.ToDto()),
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<StudentDto> GetByIdAsync(Guid id, Guid organizationId)
        {
            var student = await _unitOfWork.Repository<Student>().GetByIdAsync(id);
            if (student == null || student.OrganizationId != organizationId)
                throw new NotFoundException("Student", id);
                
            return student.ToDto();
        }

        public async Task<StudentDto> CreateAsync(Guid organizationId, StudentRequestDto request)
        {
            var repo = _unitOfWork.Repository<Student>();
            
            var existing = await repo.FindAsync(s => s.OrganizationId == organizationId && s.StudentCode == request.StudentCode);
            if (existing.Any())
                throw new BadRequestException("Mã học viên đã tồn tại trong hệ thống.");

            var student = new Student
            {
                OrganizationId = organizationId,
                FullName = request.FullName,
                StudentCode = request.StudentCode,
                BirthDate = request.BirthDate,
                ParentName = request.ParentName ?? "",
                ParentPhone = request.ParentPhone ?? "",
                ParentEmail = request.ParentEmail ?? "",
                Status = AccountStatus.ACTIVE
            };

            await repo.AddAsync(student);
            await _unitOfWork.CommitAsync();

            return student.ToDto();
        }

        public async Task UpdateAsync(Guid id, Guid organizationId, StudentRequestDto request)
        {
            var repo = _unitOfWork.Repository<Student>();
            var student = await repo.GetByIdAsync(id);
            if (student == null || student.OrganizationId != organizationId)
                throw new NotFoundException("Student", id);

            if (student.StudentCode != request.StudentCode)
            {
                var existing = await repo.FindAsync(s => s.OrganizationId == organizationId && s.StudentCode == request.StudentCode);
                if (existing.Any())
                    throw new BadRequestException("Mã học viên đã tồn tại trong hệ thống.");
            }

            student.FullName = request.FullName;
            student.StudentCode = request.StudentCode;
            student.BirthDate = request.BirthDate;
            student.ParentName = request.ParentName ?? "";
            student.ParentPhone = request.ParentPhone ?? "";
            student.ParentEmail = request.ParentEmail ?? "";

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
            student.Status = AccountStatus.SUSPENDED;
            repo.Update(student);
            await _unitOfWork.CommitAsync();
        }
    }
}
