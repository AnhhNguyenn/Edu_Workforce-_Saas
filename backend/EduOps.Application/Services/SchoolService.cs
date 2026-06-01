using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic.Schools.Requests;
using EduOps.Application.DTOs.Academic.Schools.Responses;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
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

        public async Task<PagedResult<SchoolListResponseDto>> GetSchoolsAsync(Guid organizationId, GetSchoolListQueryDto query)
        {
            try
            {
                var repo = _unitOfWork.Repository<School>();
                
                System.Linq.Expressions.Expression<Func<School, bool>> predicate = s => 
                    s.OrganizationId == organizationId &&
                    (string.IsNullOrEmpty(query.SearchKeyword) || s.Name.ToLower().Contains(query.SearchKeyword.ToLower()) || (s.Address != null && s.Address.ToLower().Contains(query.SearchKeyword.ToLower())));
                    
                var result = await repo.FindPagedAsync(predicate, query.PageNumber, query.PageSize);
                
                return new PagedResult<SchoolListResponseDto>
                {
                    Items = result.Items.Select(s => s.ToListResponseDto()),
                    TotalCount = result.TotalCount,
                    PageNumber = query.PageNumber,
                    PageSize = query.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve schools.");
                throw;
            }
        }

        public async Task<SchoolDetailResponseDto> GetByIdAsync(Guid id, Guid organizationId)
        {
            var school = await _unitOfWork.Repository<School>().GetByIdAsync(id);
            if (school == null || school.OrganizationId != organizationId)
                throw new NotFoundException("School", id);

            return school.ToDetailResponseDto();
        }

        public async Task<SchoolDetailResponseDto> CreateAsync(Guid organizationId, CreateSchoolRequestDto request)
        {
            try
            {
                request.Name = request.Name.Trim();
                if (request.Address != null) request.Address = request.Address.Trim();

                var repo = _unitOfWork.Repository<School>();
                
                var existing = await repo.FindAsync(s => s.OrganizationId == organizationId && s.Name.ToLower() == request.Name.ToLower());
                if (existing.Any())
                    throw new BadRequestException($"Một cơ sở với tên '{request.Name}' đã tồn tại trong hệ thống.");

                var school = new School
                {
                    OrganizationId = organizationId,
                    Name = request.Name,
                    Address = request.Address,
                    Latitude = request.Latitude,
                    Longitude = request.Longitude,
                    AttendanceRadius = request.AttendanceRadius,
                    LateThresholdMinutes = request.LateThresholdMinutes,
                    EarlyCheckoutMinutes = request.EarlyCheckoutMinutes
                };

                await repo.AddAsync(school);
                await _unitOfWork.CommitAsync();

                _logger.LogInformation($"Created school {school.Name} under Org {organizationId}");

                return school.ToDetailResponseDto();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create school.");
                throw;
            }
        }

        public async Task UpdateAsync(Guid id, Guid organizationId, UpdateSchoolRequestDto request)
        {
            var repo = _unitOfWork.Repository<School>();
            var school = await repo.GetByIdAsync(id);
            if (school == null || school.OrganizationId != organizationId)
                throw new NotFoundException("School", id);

            request.Name = request.Name.Trim();
            if (request.Address != null) request.Address = request.Address.Trim();

            if (!string.Equals(school.Name, request.Name, StringComparison.OrdinalIgnoreCase))
            {
                var existing = await repo.FindAsync(s => s.OrganizationId == organizationId && s.Name.ToLower() == request.Name.ToLower());
                if (existing.Any())
                    throw new BadRequestException($"Một cơ sở với tên '{request.Name}' đã tồn tại trong hệ thống.");
            }

            school.Name = request.Name;
            school.Address = request.Address;
            school.Latitude = request.Latitude;
            school.Longitude = request.Longitude;
            school.AttendanceRadius = request.AttendanceRadius;
            school.LateThresholdMinutes = request.LateThresholdMinutes;
            school.EarlyCheckoutMinutes = request.EarlyCheckoutMinutes;

            repo.Update(school);
            await _unitOfWork.CommitAsync();
        }

        public async Task DeleteAsync(Guid id, Guid organizationId)
        {
            var repo = _unitOfWork.Repository<School>();
            var school = await repo.GetByIdAsync(id);
            if (school == null || school.OrganizationId != organizationId)
                throw new NotFoundException("School", id);

            var classExists = await _unitOfWork.Repository<Class>().AnyAsync(c => c.SchoolId == id && c.DeletedAt == null && c.Status != AccountStatus.INACTIVE);
            if (classExists)
                throw new BadRequestException("Không thể xóa cơ sở này vì vẫn còn lớp học đang hoạt động. Vui lòng xóa hoặc chuyển các lớp học trước.");

            school.DeletedAt = DateTime.UtcNow;
            repo.Update(school);
            await _unitOfWork.CommitAsync();
        }
    }
}
