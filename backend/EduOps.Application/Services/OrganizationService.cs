using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Organization;
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

        public async Task<PagedResult<OrganizationDto>> GetOrganizationsAsync(int pageNumber, int pageSize, string? searchKeyword = null)
        {
            try
            {
                // Chống tràn RAM (DoS) do request pageSize quá lớn
                pageSize = Math.Min(pageSize, 100);
                pageNumber = Math.Max(pageNumber, 1);

                var repo = _unitOfWork.Repository<Organization>();
                
                var queryPredicate = string.IsNullOrEmpty(searchKeyword) 
                    ? (System.Linq.Expressions.Expression<Func<Organization, bool>>)(o => o.DeletedAt == null)
                    : (System.Linq.Expressions.Expression<Func<Organization, bool>>)(o => o.DeletedAt == null && 
                                                                                  (o.Name.ToLower().Contains(searchKeyword.ToLower()) || 
                                                                                   o.Code.ToLower().Contains(searchKeyword.ToLower()) || 
                                                                                   o.Email.ToLower().Contains(searchKeyword.ToLower())));

                var result = await repo.FindPagedAsync(queryPredicate, pageNumber, pageSize, asNoTracking: true);
                
                return new PagedResult<OrganizationDto>
                {
                    Items = result.Items.Select(o => o.ToDto()),
                    TotalCount = result.TotalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching organizations");
                throw;
            }
        }

        public async Task<OrganizationDto> GetByIdAsync(Guid id)
        {
            var org = await _unitOfWork.Repository<Organization>().GetByIdAsync(id);
            if (org == null)
            {
                _logger.LogWarning($"Organization with ID {id} not found.");
                throw new NotFoundException("Organization", id);
            }

            return org.ToDto();
        }

        public async Task<OrganizationDto> CreateAsync(OrganizationRequestDto request)
        {
            try
            {
                var repo = _unitOfWork.Repository<Organization>();

                // Kiểm tra trùng mã code (Dùng AnyAsync để tối ưu DB thay vì FindAsync)
                var codeExists = await repo.AnyAsync(x => x.Code == request.Code);
                if (codeExists)
                {
                    throw new BadRequestException($"Organization code '{request.Code}' already exists.");
                }

                var emailExists = await repo.AnyAsync(x => x.Email == request.Email);
                if (emailExists)
                {
                    throw new BadRequestException($"Email '{request.Email}' đã được sử dụng.");
                }

                var org = new Organization
                {
                    Name = request.Name,
                    Code = request.Code,
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

        public async Task UpdateAsync(Guid id, OrganizationRequestDto request)
        {
            if (_currentUserService.Role == "CENTER_ADMIN" && _currentUserService.OrganizationId != id)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền sửa thông tin của Trung tâm khác.");
            }

            var repo = _unitOfWork.Repository<Organization>();
            var org = await repo.GetByIdAsync(id);
            
            if (org == null) throw new NotFoundException("Organization", id);

            if (_currentUserService.Role == "SUPER_ADMIN")
            {
                if (request.MaxUsers < org.MaxUsers)
                {
                    var activeStaffCount = await _unitOfWork.Repository<User>().CountAsync(u => 
                        u.OrganizationId == id && 
                        u.DeletedAt == null && 
                        (u.Role == "TEACHER" || u.Role == "ASSISTANT"));
                    
                    if (activeStaffCount > request.MaxUsers)
                    {
                        throw new BadRequestException($"Không thể hạ cấp gói cước. Trung tâm hiện có {activeStaffCount} nhân sự đang hoạt động, vượt quá mức {request.MaxUsers} của gói mới. Vui lòng xóa bớt nhân sự trước!");
                    }
                }
                
                org.MaxUsers = request.MaxUsers;
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
