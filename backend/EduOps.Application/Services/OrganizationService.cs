using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Organization.Requests;
using EduOps.Application.DTOs.Organization.Responses;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class OrganizationService : IOrganizationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICustomLogger _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly Microsoft.Extensions.Caching.Memory.IMemoryCache _cache;

        public OrganizationService(IUnitOfWork unitOfWork, ICustomLogger logger, ICurrentUserService currentUserService, Microsoft.Extensions.Caching.Memory.IMemoryCache cache)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _currentUserService = currentUserService;
            _cache = cache;
        }

        public async Task<PagedResult<OrganizationListResponseDto>> GetOrganizationsAsync(GetOrganizationListQueryDto query)
        {
            try
            {
                // Chống tràn RAM (DoS) do request pageSize quá lớn
                pageSize = Math.Min(pageSize, 100);
                pageNumber = Math.Max(pageNumber, 1);

                var repo = _unitOfWork.Repository<Organization>();

                
                System.Linq.Expressions.Expression<Func<Organization, bool>> predicate = o => 
                    (string.IsNullOrEmpty(query.SearchKeyword) || o.Name.ToLower().Contains(query.SearchKeyword.ToLower()) || o.Code.ToLower().Contains(query.SearchKeyword.ToLower())) &&
                    (!query.Status.HasValue || o.Status == query.Status.Value);

                var result = await repo.FindPagedAsync(predicate, query.PageNumber, query.PageSize);
                
                return new PagedResult<OrganizationListResponseDto>
                {
                    Items = result.Items.Select(o => o.ToListResponseDto()),
                    TotalCount = result.TotalCount,
                    PageNumber = query.PageNumber,
                    PageSize = query.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching organizations");
                throw;
            }
        }

        public async Task<OrganizationDetailResponseDto> GetByIdAsync(Guid id)
        {
            var org = await _unitOfWork.Repository<Organization>().GetByIdAsync(id);
            if (org == null)
            {
                _logger.LogWarning($"Organization with ID {id} not found.");
                throw new NotFoundException("Organization", id);
            }

            return org.ToDetailResponseDto();
        }

        public async Task<OrganizationDetailResponseDto> CreateAsync(CreateOrganizationRequestDto request)
        {
            try
            {
                var repo = _unitOfWork.Repository<Organization>();

                if (request.Code != null)
                {
                    var exists = await repo.AnyAsync(x => x.Code == request.Code);
                    if (exists)
                        throw new BadRequestException("Mã trung tâm đã tồn tại trên hệ thống. Vui lòng chọn mã khác.");
                }

                var emailExists = await repo.AnyAsync(x => x.Email == request.Email);
                if (emailExists)
                {
                    throw new BadRequestException($"Email '{request.Email}' đã được sử dụng.");
                }

                var org = new Organization
                {
                    Name = request.Name,
                    Code = request.Code ?? string.Empty,
                    Email = request.Email,
                    Phone = request.Phone,
                    Address = request.Address,
                    MaxUsers = request.MaxUsers,
                    CurrentUsers = 0,
                    Status = AccountStatus.ACTIVE,
                    SubscriptionStatus = "TRIAL",
                    SubscriptionStart = DateTime.UtcNow,
                    SubscriptionEnd = DateTime.UtcNow.AddDays(14)
                };

                await repo.AddAsync(org);
                await _unitOfWork.CommitAsync();

                _logger.LogInformation($"Created new Organization: {org.Code}");

                return await GetByIdAsync(org.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating organization.");
                throw;
            }
        }

        public async Task UpdateAsync(Guid id, UpdateOrganizationRequestDto request)
        {
            if (_currentUserService.Role == "CENTER_ADMIN" && _currentUserService.OrganizationId != id)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền sửa thông tin của Trung tâm khác.");
            }

            var repo = _unitOfWork.Repository<Organization>();
            var org = await repo.GetByIdAsync(id);
            
            if (org == null) throw new NotFoundException("Organization", id);

            if (_currentUserService.Role == "SUPER_ADMIN" && request.MaxUsers.HasValue)
            {
                if (request.MaxUsers.Value < org.MaxUsers)
                {
                    var activeStaffCount = await _unitOfWork.Repository<User>().CountAsync(u => 
                        u.OrganizationId == id && 
                        u.DeletedAt == null && 
                        (u.Role == "TEACHER" || u.Role == "ASSISTANT"));
                    
                    if (activeStaffCount > request.MaxUsers.Value)
                    {
                        throw new BadRequestException($"Không thể hạ cấp gói cước. Trung tâm hiện có {activeStaffCount} nhân sự đang hoạt động, vượt quá mức {request.MaxUsers.Value} của gói mới. Vui lòng xóa bớt nhân sự trước!");
                    }
                }
                
                org.MaxUsers = request.MaxUsers.Value;
            }

            org.Name = request.Name;
            org.Email = request.Email;
            org.Phone = request.Phone;
            org.Address = request.Address;

            repo.Update(org);
            await _unitOfWork.CommitAsync();
            
            // Xóa Cache để cập nhật trạng thái ngay lập tức
            _cache.Remove($"OrgSubscription_{id}");
            _logger.LogInformation($"Updated Organization: {org.Code}");
        }

        public async Task SuspendAsync(Guid id)
        {
            var repo = _unitOfWork.Repository<Organization>();
            var org = await repo.GetByIdAsync(id);
            if (org == null) throw new NotFoundException("Organization", id);

            org.Status = AccountStatus.SUSPENDED;
            repo.Update(org);
            await _unitOfWork.CommitAsync();
            
            // Xóa Cache để lệnh Đình chỉ có hiệu lực ngay lập tức (0.001 giây)
            _cache.Remove($"OrgSubscription_{id}");
            _logger.LogWarning($"Suspended Organization: {org.Code}");
        }

        public async Task ActivateAsync(Guid id)
        {
            var repo = _unitOfWork.Repository<Organization>();
            var org = await repo.GetByIdAsync(id);
            if (org == null) throw new NotFoundException("Organization", id);

            org.Status = AccountStatus.ACTIVE;
            repo.Update(org);
            await _unitOfWork.CommitAsync();
            
            // Xóa Cache để cập nhật trạng thái ngay lập tức
            _cache.Remove($"OrgSubscription_{id}");
            _logger.LogInformation($"Activated Organization: {org.Code}");
        }
    }
}
