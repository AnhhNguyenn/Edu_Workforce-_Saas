using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
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

        public async Task<IEnumerable<ClassDto>> GetClassesAsync(Guid organizationId, Guid? schoolId)
        {
            var repo = _unitOfWork.Repository<Class>();
            
            var classes = schoolId.HasValue
                ? await repo.FindAsync(c => c.OrganizationId == organizationId && c.SchoolId == schoolId)
                : await repo.FindAsync(c => c.OrganizationId == organizationId);

            return classes.Select(c => c.ToDto());
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
                throw new Exception("Invalid School ID");

            var newClass = new Class
            {
                OrganizationId = organizationId,
                SchoolId = request.SchoolId,
                Name = request.Name,
                Grade = request.Grade,
                Subject = request.Subject,
                Description = request.Description,
                Status = "ACTIVE"
            };

            await _unitOfWork.Repository<Class>().AddAsync(newClass);
            await _unitOfWork.CommitAsync();

            return newClass.ToDto();
        }

        public async Task UpdateAsync(Guid id, Guid organizationId, ClassRequestDto request)
        {
            var classEntity = await _unitOfWork.Repository<Class>().GetByIdAsync(id);
            if (classEntity == null || classEntity.OrganizationId != organizationId)
                throw new NotFoundException("Class", id);

            if (classEntity.SchoolId != request.SchoolId)
            {
                var school = await _unitOfWork.Repository<School>().GetByIdAsync(request.SchoolId);
                if (school == null || school.OrganizationId != organizationId)
                    throw new Exception("Invalid School ID");
                classEntity.SchoolId = request.SchoolId;
            }

            classEntity.Name = request.Name;
            classEntity.Grade = request.Grade;
            classEntity.Subject = request.Subject;
            classEntity.Description = request.Description;

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
            repo.Update(classEntity);
            await _unitOfWork.CommitAsync();
        }
    }
}
