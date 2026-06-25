using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs.SystemSettings.Requests;
using EduOps.Application.DTOs.SystemSettings.Responses;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Hangfire;
using Microsoft.EntityFrameworkCore;

namespace EduOps.Application.Services
{
    public class SystemSettingService : ISystemSettingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMemoryCache _cache;
        private readonly ICurrentUserService _currentUserService;
        private readonly Hangfire.IRecurringJobManager _recurringJobManager;
        private readonly IRealtimeNotificationService _realtimeNotification;

        private const string CACHE_KEY_PREFIX = "SYS_SETTING_";
        private const string ALL_PUBLIC_SETTINGS_CACHE_KEY = "ALL_PUBLIC_SETTINGS";
        private const string ALL_SETTINGS_CACHE_KEY = "ALL_SETTINGS";

        public SystemSettingService(
            IUnitOfWork unitOfWork, 
            IMemoryCache cache, 
            ICurrentUserService currentUserService,
            Hangfire.IRecurringJobManager recurringJobManager,
            IRealtimeNotificationService realtimeNotification)
        {
            _unitOfWork = unitOfWork;
            _cache = cache;
            _currentUserService = currentUserService;
            _recurringJobManager = recurringJobManager;
            _realtimeNotification = realtimeNotification;
        }

        public async Task<List<SystemSettingResponseDto>> GetAllSettingsAsync()
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được xem toàn bộ cấu hình hệ thống.");

            return await _cache.GetOrCreateAsync(ALL_SETTINGS_CACHE_KEY, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24);
                var settings = await _unitOfWork.Repository<SystemSetting>().FindAsync(x => true, ignoreQueryFilters: true);
                return settings.Select(s => s.ToResponseDto()).ToList();
            }) ?? new List<SystemSettingResponseDto>();
        }

        public async Task<List<SystemSettingResponseDto>> GetPublicSettingsAsync()
        {
            return await _cache.GetOrCreateAsync(ALL_PUBLIC_SETTINGS_CACHE_KEY, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24);
                // SystemSettings is Global, so ignoreQueryFilters is fine, but we need predicate
                var settings = await _unitOfWork.Repository<SystemSetting>().FindAsync(s => s.IsPublic, ignoreQueryFilters: true);
                return settings.Select(s => s.ToResponseDto()).ToList();
            }) ?? new List<SystemSettingResponseDto>();
        }

        public async Task<string?> GetSettingValueAsync(string key)
        {
            string cacheKey = CACHE_KEY_PREFIX + key;

            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24);
                var setting = await _unitOfWork.Repository<SystemSetting>().FirstOrDefaultAsync(s => s.SettingKey == key, ignoreQueryFilters: true);
                return setting?.SettingValue;
            });
        }

        public async Task<bool> IsFeatureEnabledAsync(string featureKey)
        {
            var value = await GetSettingValueAsync(featureKey);
            if (string.IsNullOrEmpty(value)) return true; // Default to true if not configured, to prevent breaking

            if (bool.TryParse(value, out bool isEnabled))
            {
                return isEnabled;
            }
            return true;
        }

        public async Task UpdateSettingAsync(string key, SystemSettingUpdateRequestDto request)
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được thay đổi cấu hình hệ thống.");

            var setting = await _unitOfWork.Repository<SystemSetting>().FirstOrDefaultAsync(s => s.SettingKey == key, ignoreQueryFilters: true);
            if (setting == null)
            {
                setting = new SystemSetting
                {
                    SettingKey = key,
                    SettingValue = request.SettingValue,
                    Description = "System generated setting",
                    IsPublic = false // default
                };
                await _unitOfWork.Repository<SystemSetting>().AddAsync(setting);
            }
            else
            {
                setting.SettingValue = request.SettingValue;
                _unitOfWork.Repository<SystemSetting>().Update(setting);
            }
            
            await _unitOfWork.CommitAsync();

            // Xóa Cache để cập nhật ngay lập tức
            _cache.Remove(CACHE_KEY_PREFIX + key);
            _cache.Remove(ALL_SETTINGS_CACHE_KEY);
            if (setting.IsPublic)
            {
                _cache.Remove(ALL_PUBLIC_SETTINGS_CACHE_KEY);
            }

            // Dynamic Cron Job Rescheduling
            if (key == "DAILY_REMINDER_CRON")
            {
                _recurringJobManager.AddOrUpdate<EduOps.Application.BackgroundJobs.NotificationJobs>(
                    "Daily_Reminder_Job",
                    job => job.SendDailyRemindersAsync(),
                    request.SettingValue,
                    new Hangfire.RecurringJobOptions { TimeZone = System.TimeZoneInfo.Local }
                );
            }
            else if (key == "SUBSCRIPTION_EXPIRY_CRON")
            {
                _recurringJobManager.AddOrUpdate<EduOps.Application.BackgroundJobs.NotificationJobs>(
                    "Subscription_Expiry_Job",
                    job => job.CheckSubscriptionExpiryAsync(),
                    request.SettingValue,
                    new Hangfire.RecurringJobOptions { TimeZone = System.TimeZoneInfo.Local }
                );
            }

            await _realtimeNotification.SendToAllAsync("SystemSettingUpdated");
        }

        public async Task<EduOps.Application.DTOs.PagedResult<AuditLogResponseDto>> GetAuditLogsAsync(int pageNumber = 1, int pageSize = 100)
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được xem Audit Logs.");

            var query = _unitOfWork.Repository<AuditLog>().GetQueryable().IgnoreQueryFilters();
            var totalCount = await query.CountAsync();
            
            var logs = await query.OrderByDescending(x => x.CreatedAt)
                            .Skip((pageNumber - 1) * pageSize)
                            .Take(pageSize)
                            .ToListAsync();
                            
            var userIds = logs.Select(x => x.UserId).Distinct().ToList();
            var users = await _unitOfWork.Repository<User>().FindAsync(u => userIds.Contains(u.Id), ignoreQueryFilters: true);
            var userDict = users.ToDictionary(u => u.Id, u => u);

            var orgIds = logs.Where(x => x.OrganizationId.HasValue).Select(x => x.OrganizationId!.Value).Distinct().ToList();
            var orgs = await _unitOfWork.Repository<Organization>().FindAsync(o => orgIds.Contains(o.Id), ignoreQueryFilters: true);
            var orgDict = orgs.ToDictionary(o => o.Id, o => o);

            var items = logs.Select(x => new AuditLogResponseDto
            {
                Id = x.Id,
                UserId = x.UserId,
                UserEmail = userDict.ContainsKey(x.UserId) ? userDict[x.UserId].Email : "Unknown",
                UserName = userDict.ContainsKey(x.UserId) ? userDict[x.UserId].FullName : "Unknown",
                OrganizationName = x.OrganizationId.HasValue && orgDict.ContainsKey(x.OrganizationId.Value) 
                    ? orgDict[x.OrganizationId.Value].Name 
                    : "Hệ thống (System)",
                Action = x.Action,
                EntityType = x.EntityType,
                EntityId = x.EntityId,
                OldData = x.OldData,
                NewData = x.NewData,
                IpAddress = x.IpAddress,
                UserAgent = x.UserAgent,
                CreatedAt = x.CreatedAt
            }).ToList();

            return new EduOps.Application.DTOs.PagedResult<AuditLogResponseDto> 
            {
                Items = items, 
                TotalCount = totalCount, 
                PageNumber = pageNumber, 
                PageSize = pageSize 
            };
        }
    }
}
