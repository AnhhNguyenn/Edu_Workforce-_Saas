using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.SystemBroadcast;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class SystemBroadcastService : ISystemBroadcastService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRealtimeNotificationService _realtimeService;

        public SystemBroadcastService(IUnitOfWork unitOfWork, IRealtimeNotificationService realtimeService)
        {
            _unitOfWork = unitOfWork;
            _realtimeService = realtimeService;
        }

        private SystemBroadcastDto MapToDto(SystemBroadcast entity)
        {
            return new SystemBroadcastDto
            {
                Id = entity.Id,
                Title = entity.Title,
                Message = entity.Message,
                Type = entity.Type,
                ActionLink = entity.ActionLink,
                TargetRoles = entity.TargetRoles,
                TargetPercentage = entity.TargetPercentage,
                IsSent = entity.IsSent,
                SentAt = entity.SentAt,
                IsRecalled = entity.IsRecalled,
                RecalledAt = entity.RecalledAt,
                CreatedAt = entity.CreatedAt
            };
        }

        public async Task<PagedResult<SystemBroadcastDto>> GetPagedAsync(int pageNumber, int pageSize)
        {
            var result = await _unitOfWork.Repository<SystemBroadcast>()
                .FindPagedAsync(b => true, pageNumber, pageSize);

            return new PagedResult<SystemBroadcastDto>
            {
                Items = result.Items.Select(MapToDto),
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<SystemBroadcastDto> GetByIdAsync(Guid id)
        {
            var entity = await _unitOfWork.Repository<SystemBroadcast>().GetByIdAsync(id);
            if (entity == null) throw new NotFoundException("SystemBroadcast", id);
            return MapToDto(entity);
        }

        public async Task<SystemBroadcastDto> CreateAsync(CreateSystemBroadcastDto dto)
        {
            var entity = new SystemBroadcast
            {
                Title = dto.Title,
                Message = dto.Message,
                Type = dto.Type,
                ActionLink = dto.ActionLink,
                TargetRoles = dto.TargetRoles,
                TargetPercentage = dto.TargetPercentage,
                IsSent = false
            };

            await _unitOfWork.Repository<SystemBroadcast>().AddAsync(entity);
            await _unitOfWork.CommitAsync();

            return MapToDto(entity);
        }

        public async Task<SystemBroadcastDto> UpdateAsync(Guid id, UpdateSystemBroadcastDto dto)
        {
            var entity = await _unitOfWork.Repository<SystemBroadcast>().GetByIdAsync(id);
            if (entity == null) throw new NotFoundException("SystemBroadcast", id);
            
            if (entity.IsSent) throw new BadRequestException("Cannot edit a broadcast that has already been sent.");

            entity.Title = dto.Title;
            entity.Message = dto.Message;
            entity.Type = dto.Type;
            entity.ActionLink = dto.ActionLink;
            entity.TargetRoles = dto.TargetRoles;
            entity.TargetPercentage = dto.TargetPercentage;

            _unitOfWork.Repository<SystemBroadcast>().Update(entity);
            await _unitOfWork.CommitAsync();

            return MapToDto(entity);
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await _unitOfWork.Repository<SystemBroadcast>().GetByIdAsync(id);
            if (entity == null) throw new NotFoundException("SystemBroadcast", id);

            if (entity.IsSent && !entity.IsRecalled)
            {
                throw new BadRequestException("You must recall the broadcast before deleting it.");
            }

            // Xóa các notification liên quan nếu có
            var notifRepo = _unitOfWork.Repository<Notification>();
            var relatedNotifs = await notifRepo.FindAsync(n => n.SystemBroadcastId == id);
            foreach(var n in relatedNotifs) {
                notifRepo.Remove(n);
            }

            _unitOfWork.Repository<SystemBroadcast>().Remove(entity);
            await _unitOfWork.CommitAsync();
        }

        public async Task SendAsync(Guid id)
        {
            var entity = await _unitOfWork.Repository<SystemBroadcast>().GetByIdAsync(id);
            if (entity == null) throw new NotFoundException("SystemBroadcast", id);

            if (entity.IsSent) throw new BadRequestException("Broadcast is already sent.");

            // 1. Fetch Users logic
            var userRepo = _unitOfWork.Repository<User>();
            var usersQuery = await userRepo.FindAsync(u => u.StatusId != null); // All active-ish users

            // Filter by roles if specified
            if (!string.IsNullOrWhiteSpace(entity.TargetRoles))
            {
                var targetRoleCodes = entity.TargetRoles.Split(',').Select(r => r.Trim().ToUpper()).ToList();
                var roleRepo = _unitOfWork.Repository<Role>();
                var targetRoles = await roleRepo.FindAsync(r => targetRoleCodes.Contains(r.Code.ToUpper()));
                var targetRoleIds = targetRoles.Select(r => r.Id).ToList();

                usersQuery = usersQuery.Where(u => u.RoleId.HasValue && targetRoleIds.Contains(u.RoleId.Value)).ToList();
            }

            // Calculate percentage
            var totalMatchingUsers = usersQuery.Count();
            if (totalMatchingUsers == 0) throw new BadRequestException("No users match the broadcast criteria.");

            var numToSend = (int)Math.Ceiling(totalMatchingUsers * (entity.TargetPercentage / 100.0));
            
            // Randomly select users
            var selectedUsers = usersQuery.OrderBy(u => Guid.NewGuid()).Take(numToSend).ToList();

            // 2. Create Notifications
            var notifRepo = _unitOfWork.Repository<Notification>();
            var now = DateTime.UtcNow;
            var notificationTypeId = (await _unitOfWork.Repository<NotificationType>().FirstOrDefaultAsync(t => t.Code == "SYSTEM_ALERT"))?.Id;

            var newNotifs = new List<Notification>();

            foreach (var user in selectedUsers)
            {
                var notif = new Notification
                {
                    UserId = user.Id,
                    Title = entity.Title,
                    Message = entity.Message,
                    TypeId = notificationTypeId,
                    IsRead = false,
                    ActionLink = entity.ActionLink,
                    SystemBroadcastId = entity.Id,
                    CreatedAt = now
                };
                newNotifs.Add(notif);
                await notifRepo.AddAsync(notif);
            }

            entity.IsSent = true;
            entity.SentAt = now;
            _unitOfWork.Repository<SystemBroadcast>().Update(entity);

            await _unitOfWork.CommitAsync();

            // 3. Realtime Broadcast
            await _realtimeService.SendToAllAsync("SystemBroadcastReceived");
        }

        public async Task RecallAsync(Guid id)
        {
            var entity = await _unitOfWork.Repository<SystemBroadcast>().GetByIdAsync(id);
            if (entity == null) throw new NotFoundException("SystemBroadcast", id);

            if (!entity.IsSent) throw new BadRequestException("Broadcast is not sent yet.");
            if (entity.IsRecalled) throw new BadRequestException("Broadcast is already recalled.");

            // Xóa hết các Notification liên quan
            var notifRepo = _unitOfWork.Repository<Notification>();
            var relatedNotifs = await notifRepo.FindAsync(n => n.SystemBroadcastId == id);
            
            foreach(var n in relatedNotifs) {
                notifRepo.Remove(n);
            }

            entity.IsRecalled = true;
            entity.RecalledAt = DateTime.UtcNow;
            
            _unitOfWork.Repository<SystemBroadcast>().Update(entity);
            await _unitOfWork.CommitAsync();

            await _realtimeService.SendToAllAsync("SystemBroadcastRecalled");
        }
    }
}
