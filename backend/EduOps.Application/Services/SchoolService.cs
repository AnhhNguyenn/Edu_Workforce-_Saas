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
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class SchoolService : ISchoolService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICustomLogger _logger;

        public SchoolService(IUnitOfWork unitOfWork, ICustomLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<PagedResult<SchoolDto>> GetSchoolsAsync(Guid organizationId, int pageNumber, int pageSize, string? searchKeyword = null)
        {
            try
            {
                var repo = _unitOfWork.Repository<School>();
                
                System.Linq.Expressions.Expression<Func<School, bool>> predicate = s => 
                    s.OrganizationId == organizationId &&
                    (string.IsNullOrEmpty(searchKeyword) || s.Name.Contains(searchKeyword) || (s.Address != null && s.Address.Contains(searchKeyword)));
                    
                var result = await repo.FindPagedAsync(predicate, pageNumber, pageSize);
                
                return new PagedResult<SchoolDto>
                {
                    Items = result.Items.Select(s => s.ToDto()),
                    TotalCount = result.TotalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve schools.");
                throw;
            }
        }

        public async Task<SchoolDto> GetByIdAsync(Guid id, Guid organizationId)
        {
            var school = await _unitOfWork.Repository<School>().GetByIdAsync(id);
            if (school == null || school.OrganizationId != organizationId)
                throw new NotFoundException("School", id);

            return school.ToDto();
        }

        public async Task<SchoolDto> CreateAsync(Guid organizationId, SchoolRequestDto request)
        {
            try
            {
                var repo = _unitOfWork.Repository<School>();
                var school = new School
                {
                    OrganizationId = organizationId,
                    Name = request.Name,
                    Address = request.Address,
                    Latitude = request.Latitude,
                    Longitude = request.Longitude,
                    AttendanceRadius = request.AttendanceRadius,
                    LateThresholdMinutes = request.LateThresholdMinutes
                };

                await repo.AddAsync(school);
                await _unitOfWork.CommitAsync();

                _logger.LogInformation($"Created school {school.Name} under Org {organizationId}");

                return school.ToDto();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create school.");
                throw;
            }
        }

        public async Task UpdateAsync(Guid id, Guid organizationId, SchoolRequestDto request)
        {
            var school = await _unitOfWork.Repository<School>().GetByIdAsync(id);
            if (school == null || school.OrganizationId != organizationId)
                throw new NotFoundException("School", id);

            school.Name = request.Name;
            school.Address = request.Address;
            school.Latitude = request.Latitude;
            school.Longitude = request.Longitude;
            school.AttendanceRadius = request.AttendanceRadius;
            school.LateThresholdMinutes = request.LateThresholdMinutes;

            _unitOfWork.Repository<School>().Update(school);
            await _unitOfWork.CommitAsync();
        }

        public async Task DeleteAsync(Guid id, Guid organizationId)
        {
            var repo = _unitOfWork.Repository<School>();
            var school = await repo.GetByIdAsync(id);
            if (school == null || school.OrganizationId != organizationId)
                throw new NotFoundException("School", id);

            school.DeletedAt = DateTime.UtcNow;
            repo.Update(school);
            await _unitOfWork.CommitAsync();
        }
    }
}
