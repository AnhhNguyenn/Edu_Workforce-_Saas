using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Notification;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRealtimeNotificationService _realtimeService;
        private readonly ICustomLogger _logger;

        public NotificationService(IUnitOfWork unitOfWork, IRealtimeNotificationService realtimeService, ICustomLogger logger)
        {
            _unitOfWork = unitOfWork;
            _realtimeService = realtimeService;
            _logger = logger;
        }

        public async Task<NotificationDto> CreateAndSendAsync(Guid userId, string title, string message, string type)
        {
            try
            {
                var repo = _unitOfWork.Repository<Notification>();
                var notification = new Notification
                {
                    UserId = userId,
                    Title = title,
                    Message = message,
                    Type = type,
                    IsRead = false
                };

                await repo.AddAsync(notification);
                await _unitOfWork.CommitAsync();

                var dto = notification.ToDto();

                // Đẩy thông báo Realtime qua SignalR
                await _realtimeService.SendToUserAsync(userId, "ReceiveNotification", dto);

                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create and send notification to User: {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId)
        {
            var repo = _unitOfWork.Repository<Notification>();
            var notifications = await repo.FindAsync(n => n.UserId == userId);
            return notifications.OrderByDescending(n => n.CreatedAt).Select(n => n.ToDto());
        }

        public async Task MarkAsReadAsync(Guid id)
        {
            var repo = _unitOfWork.Repository<Notification>();
            var notif = await repo.GetByIdAsync(id);
            if (notif == null) throw new NotFoundException("Notification", id);

            notif.IsRead = true;
            repo.Update(notif);
            await _unitOfWork.CommitAsync();
        }
    }
}
