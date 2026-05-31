using System;
using System.Collections.Generic;
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
    public class ClassService : IClassService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ClassService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PagedResult<ClassDto>> GetClassesAsync(Guid organizationId, Guid? schoolId, int pageNumber, int pageSize, string? searchKeyword = null)
        {
            var repo = _unitOfWork.Repository<Class>();
            
            System.Linq.Expressions.Expression<Func<Class, bool>> predicate = c => 
                c.OrganizationId == organizationId &&
                (!schoolId.HasValue || c.SchoolId == schoolId) &&
                (string.IsNullOrEmpty(searchKeyword) || c.Name.Contains(searchKeyword) || (c.Subject != null && c.Subject.Contains(searchKeyword)));

            var result = await repo.FindPagedAsync(predicate, pageNumber, pageSize);

            return new PagedResult<ClassDto>
            {
                Items = result.Items.Select(c => c.ToDto()),
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<ClassDto> GetByIdAsync(Guid id, Guid organizationId)
        {
            var classEntity = await _unitOfWork.Repository<Class>().GetByIdAsync(id);
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", id);
            return classEntity.ToDto();
        }

        public async Task<ClassDto> CreateAsync(Guid organizationId, ClassRequestDto request)
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

            return newClass.ToDto();
        }

        public async Task UpdateAsync(Guid id, Guid organizationId, ClassRequestDto request)
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
            await _unitOfWork.CommitAsync();
        }
    }
}
