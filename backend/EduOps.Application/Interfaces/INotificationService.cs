using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Notification;

namespace EduOps.Application.Interfaces
{
    public interface INotificationService
    {
        Task<NotificationDto> CreateAndSendAsync(Guid userId, string title, string message, string type);
        Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId);
        Task MarkAsReadAsync(Guid id);
    }
}
