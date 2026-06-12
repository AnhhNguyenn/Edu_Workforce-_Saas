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

using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class SchoolService : ISchoolService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICustomLogger _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly INotificationService _notificationService;

        public SchoolService(IUnitOfWork unitOfWork, ICustomLogger logger, ICurrentUserService currentUserService, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _currentUserService = currentUserService;
            _notificationService = notificationService;
        }

        public async Task<PagedResult<SchoolListResponseDto>> GetSchoolsAsync(Guid organizationId, GetSchoolListQueryDto query)
        {
            try
            {
                var repo = _unitOfWork.Repository<School>();

                System.Linq.Expressions.Expression<Func<School, bool>> predicate = s =>
                    s.OrganizationId == organizationId &&
                    (string.IsNullOrEmpty(query.SearchKeyword) || s.Name.ToLower().Contains(query.SearchKeyword.ToLower()));

                var result = await repo.FindPagedAsync(predicate, query.PageNumber, query.PageSize, includeProperties: "SchoolDetail");
                var items = result.Items.ToList();

                return new PagedResult<SchoolListResponseDto>
                {
                    Items = items.Select(s => s.ToListResponseDto()),
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
            var school = await _unitOfWork.Repository<School>().FirstOrDefaultAsync(s => s.Id == id, includeProperties: "SchoolDetail");
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

                var existing = await repo.AnyAsync(s => s.OrganizationId == organizationId && s.Name.ToLower() == request.Name.ToLower());
                if (existing)
                    throw new BadRequestException($"Một cơ sở với tên '{request.Name}' đã tồn tại trong hệ thống.");

                var school = new School
                {
                    OrganizationId = organizationId,
                    Name = request.Name,
                    SchoolDetail = new SchoolDetail
                    {
                        Address = request.Address,
                        Latitude = request.Latitude,
                        Longitude = request.Longitude,
                        AttendanceRadius = request.AttendanceRadius,
                        LateThresholdMinutes = request.LateThresholdMinutes
                    }
                };

                await repo.AddAsync(school);
                await _unitOfWork.CommitAsync();

                _logger.LogInformation($"Created school {school.Name} under Org {organizationId}");

                if (_currentUserService.UserId != Guid.Empty)
                {
                    await _notificationService.CreateAndSendAsync(
                        _currentUserService.UserId,
                        "Hệ thống",
                        $"Bạn đã tạo thành công cơ sở mới: {school.Name}",
                        "SYSTEM"
                    );
                }

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
                var existing = await repo.AnyAsync(s => s.OrganizationId == organizationId && s.Name.ToLower() == request.Name.ToLower());
                if (existing)
                    throw new BadRequestException($"Một cơ sở với tên '{request.Name}' đã tồn tại trong hệ thống.");
            }

            school.Name = request.Name;
            
            school.SchoolDetail = await _unitOfWork.Repository<SchoolDetail>().FirstOrDefaultAsync(d => d.SchoolId == school.Id);
            if (school.SchoolDetail == null)
            {
                school.SchoolDetail = new SchoolDetail { SchoolId = school.Id };
                await _unitOfWork.Repository<SchoolDetail>().AddAsync(school.SchoolDetail);
            }
            
            school.SchoolDetail.Address = request.Address;
            school.SchoolDetail.Latitude = request.Latitude;
            school.SchoolDetail.Longitude = request.Longitude;
            school.SchoolDetail.AttendanceRadius = request.AttendanceRadius;
            school.SchoolDetail.LateThresholdMinutes = request.LateThresholdMinutes;
            
            _unitOfWork.Repository<SchoolDetail>().Update(school.SchoolDetail);

            repo.Update(school);
            await _unitOfWork.CommitAsync();

            if (_currentUserService.UserId != Guid.Empty)
            {
                await _notificationService.CreateAndSendAsync(
                    _currentUserService.UserId,
                    "Hệ thống",
                    $"Bạn đã cập nhật thành công cơ sở: {school.Name}",
                    "SYSTEM"
                );
            }
        }

        public async Task DeleteAsync(Guid id, Guid organizationId)
        {
            var repo = _unitOfWork.Repository<School>();
            var school = await repo.GetByIdAsync(id);
            if (school == null || school.OrganizationId != organizationId)
                throw new NotFoundException("School", id);

            var inactiveStatus = await _unitOfWork.Repository<AccountStatus>().FirstOrDefaultAsync(s => s.Code == "INACTIVE");
            var classExists = await _unitOfWork.Repository<Class>().AnyAsync(c => c.SchoolId == id && c.DeletedAt == null && (inactiveStatus == null || c.StatusId != inactiveStatus.Id));
            if (classExists)
                throw new BadRequestException("Không thể xóa cơ sở này vì vẫn còn lớp học đang hoạt động. Vui lòng xóa hoặc chuyển các lớp học trước.");

            school.DeletedAt = DateTime.UtcNow;
            repo.Update(school);
            await _unitOfWork.CommitAsync();
        }
    }
}
