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
                query.PageSize = Math.Min(query.PageSize, 100);
                query.PageNumber = Math.Max(query.PageNumber, 1);

                var repo = _unitOfWork.Repository<Organization>();


                System.Linq.Expressions.Expression<Func<Organization, bool>> predicate = o =>
                    (string.IsNullOrEmpty(query.SearchKeyword) || o.Name.ToLower().Contains(query.SearchKeyword.ToLower()) || o.Code.ToLower().Contains(query.SearchKeyword.ToLower())) &&
                    (!query.Status.HasValue || o.Status != null && o.Status.Code == query.Status.Value.ToString());

                var result = await repo.FindPagedAsync(predicate, query.PageNumber, query.PageSize, includeProperties: "Status");

                var orgIds = result.Items.Select(o => o.Id).ToList();
                var planIds = result.Items.Where(o => o.CurrentPlanId.HasValue).Select(o => o.CurrentPlanId!.Value).Distinct().ToList();

                var plans = await _unitOfWork.Repository<SubscriptionPlan>().FindAsync(p => planIds.Contains(p.Id));
                var planDict = plans.ToDictionary(p => p.Id, p => p.MaxUsers);

                var users = await _unitOfWork.Repository<User>().FindAsync(u => 
                    u.OrganizationId.HasValue && orgIds.Contains(u.OrganizationId.Value) &&
                    u.DeletedAt == null && u.Role != null && (u.Role.Code == "TEACHER" || u.Role.Code == "ASSISTANT"));
                
                var userCounts = users.GroupBy(u => u.OrganizationId!.Value)
                                      .ToDictionary(g => g.Key, g => g.Count());

                var trialMaxUserSetting = await _unitOfWork.Repository<SystemSetting>().FirstOrDefaultAsync(s => s.SettingKey == "DEFAULT_TRIAL_MAX_USERS");
                int defaultTrialMaxUsers = 5;
                if (trialMaxUserSetting != null && int.TryParse(trialMaxUserSetting.SettingValue, out int v)) defaultTrialMaxUsers = v;

                var dtos = result.Items.Select(o => 
                {
                    int maxUsers = 0;
                    if (o.SubscriptionStatus == "UNPAID" || o.SubscriptionStatus == "EXPIRED")
                    {
                        maxUsers = 0;
                    }
                    else if (o.SubscriptionStatus == "TRIAL")
                    {
                        maxUsers = o.CustomTrialMaxUsers ?? defaultTrialMaxUsers;
                    }
                    else
                    {
                        maxUsers = o.CurrentPlanId.HasValue && planDict.ContainsKey(o.CurrentPlanId.Value) ? planDict[o.CurrentPlanId.Value] : 0;
                    }

                    int currentUsers = userCounts.ContainsKey(o.Id) ? userCounts[o.Id] : 0;
                    return o.ToListResponseDto(maxUsers, currentUsers);
                }).ToList();

                return new PagedResult<OrganizationListResponseDto>
                {
                    Items = dtos,
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
            var org = await _unitOfWork.Repository<Organization>().FirstOrDefaultAsync(o => o.Id == id, includeProperties: "Status,OrganizationDetail");
            if (org == null)
            {
                _logger.LogWarning($"Organization with ID {id} not found.");
                throw new NotFoundException("Organization", id);
            }

            int maxUsers = 0;
            if (org.SubscriptionStatus == "UNPAID" || org.SubscriptionStatus == "EXPIRED")
            {
                maxUsers = 0;
            }
            else if (org.SubscriptionStatus == "TRIAL")
            {
                var trialMaxUserSetting = await _unitOfWork.Repository<SystemSetting>().FirstOrDefaultAsync(s => s.SettingKey == "DEFAULT_TRIAL_MAX_USERS");
                int defaultTrialMaxUsers = 5;
                if (trialMaxUserSetting != null && int.TryParse(trialMaxUserSetting.SettingValue, out int v)) defaultTrialMaxUsers = v;
                
                maxUsers = org.CustomTrialMaxUsers ?? defaultTrialMaxUsers;
            }
            else if (org.CurrentPlanId.HasValue)
            {
                var plan = await _unitOfWork.Repository<SubscriptionPlan>().GetByIdAsync(org.CurrentPlanId.Value);
                if (plan != null) maxUsers = plan.MaxUsers;
            }

            int currentUsers = await _unitOfWork.Repository<User>().CountAsync(u => 
                u.OrganizationId == id && u.DeletedAt == null && u.Role != null && (u.Role.Code == "TEACHER" || u.Role.Code == "ASSISTANT"));

            return org.ToDetailResponseDto(maxUsers, currentUsers);
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

                var emailExists = await repo.AnyAsync(x => x.OrganizationDetail != null && x.OrganizationDetail.Email == request.Email);
                if (emailExists)
                {
                    throw new BadRequestException($"Email '{request.Email}' đã được sử dụng.");
                }

                var plan = await _unitOfWork.Repository<SubscriptionPlan>().GetByIdAsync(request.PlanId);
                if (plan == null) throw new NotFoundException("Gói cước", request.PlanId);

                // Lấy Trial Days từ SystemSettings
                var trialSetting = await _unitOfWork.Repository<SystemSetting>().FirstOrDefaultAsync(s => s.SettingKey == "DEFAULT_TRIAL_DAYS");
                int trialDays = 14; // Default
                if (trialSetting != null && int.TryParse(trialSetting.SettingValue, out int configuredDays))
                {
                    trialDays = configuredDays;
                }

                var enableTrialSetting = await _unitOfWork.Repository<SystemSetting>().FirstOrDefaultAsync(s => s.SettingKey == "ENABLE_TRIAL");
                bool isTrialEnabled = true; // default
                if (enableTrialSetting != null && bool.TryParse(enableTrialSetting.SettingValue, out bool val))
                {
                    isTrialEnabled = val;
                }

                var activeStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "ACTIVE");
                
                var org = new Organization
                {
                    Name = request.Name,
                    Code = request.Code ?? string.Empty,
                    OrganizationDetail = new OrganizationDetail
                    {
                        Email = request.Email,
                        Phone = request.Phone,
                        Address = request.Address
                    },
                    StatusId = activeStatus?.Id,
                    CustomTrialMaxUsers = request.CustomTrialMaxUsers
                };

                if (!isTrialEnabled || request.SkipTrial)
                {
                    org.SubscriptionStatus = "UNPAID";
                    org.CurrentPlanId = plan.Id;
                    org.SubscriptionStart = null;
                    org.SubscriptionEnd = null;
                }
                else
                {
                    org.SubscriptionStatus = "TRIAL";
                    org.CurrentPlanId = plan.Id;
                    org.SubscriptionStart = DateTime.UtcNow;
                    org.SubscriptionEnd = DateTime.UtcNow.AddDays(trialDays);
                }

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



            org.Name = request.Name;
            
            if (org.OrganizationDetail == null) org.OrganizationDetail = new OrganizationDetail();
            
            org.OrganizationDetail.Email = request.Email;
            org.OrganizationDetail.Phone = request.Phone;
            org.OrganizationDetail.Address = request.Address;

            if (_currentUserService.Role == "SUPER_ADMIN")
            {
                org.CustomTrialMaxUsers = request.CustomTrialMaxUsers;
            }

            repo.Update(org);
            await _unitOfWork.CommitAsync();

            // Xóa Cache để cập nhật trạng thái ngay lập tức
            _cache.Remove($"OrgSubscription_{id}");
            _logger.LogInformation($"Updated Organization: {org.Code}");
        }

        public async Task UpdateSubscriptionAsync(Guid id, UpdateOrganizationSubscriptionRequestDto request)
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
            {
                throw new UnauthorizedAccessException("Chỉ Super Admin mới có quyền đổi gói cước thủ công.");
            }

            var repo = _unitOfWork.Repository<Organization>();
            var org = await repo.GetByIdAsync(id);

            if (org == null) throw new NotFoundException("Organization", id);

            if (request.PlanId.HasValue)
            {
                var plan = await _unitOfWork.Repository<SubscriptionPlan>().GetByIdAsync(request.PlanId.Value);
                if (plan == null) throw new NotFoundException("SubscriptionPlan", request.PlanId.Value);
            }

            org.CurrentPlanId = request.PlanId;
            org.SubscriptionStatus = request.SubscriptionStatus;
            
            if (request.SubscriptionStatus == "PAID" && !org.SubscriptionStart.HasValue)
            {
                org.SubscriptionStart = DateTime.UtcNow;
            }

            org.SubscriptionEnd = request.SubscriptionEnd;

            repo.Update(org);
            await _unitOfWork.CommitAsync();

            _cache.Remove($"OrgSubscription_{id}");
            _logger.LogInformation($"Updated Subscription for Organization: {org.Code}");
        }

        public async Task SuspendAsync(Guid id)
        {
            var repo = _unitOfWork.Repository<Organization>();
            var org = await repo.GetByIdAsync(id);
            if (org == null) throw new NotFoundException("Organization", id);

            var suspendedStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "SUSPENDED");
            org.StatusId = suspendedStatus?.Id;
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

            var activeStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "ACTIVE");
            org.StatusId = activeStatus?.Id;
            repo.Update(org);
            await _unitOfWork.CommitAsync();

            // Xóa Cache để cập nhật trạng thái ngay lập tức
            _cache.Remove($"OrgSubscription_{id}");
            _logger.LogInformation($"Activated Organization: {org.Code}");
        }

        public async Task DeleteAsync(Guid id)
        {
            var repo = _unitOfWork.Repository<Organization>();
            var org = await repo.GetByIdAsync(id);
            if (org == null || org.DeletedAt != null) throw new NotFoundException("Organization", id);

            var inactiveStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "INACTIVE");
            org.StatusId = inactiveStatus?.Id;
            org.DeletedAt = DateTime.UtcNow;
            
            repo.Update(org);
            await _unitOfWork.CommitAsync();

            _cache.Remove($"OrgSubscription_{id}");
            _logger.LogWarning($"Soft Deleted Organization: {org.Code}");
        }
    }
}
