using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic;
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
    }
}
