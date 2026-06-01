using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Notification;

namespace EduOps.Application.Interfaces
{
    public interface INotificationService
    {
        Task<NotificationDto> CreateAndSendAsync(Guid userId, string title, string message, string type);
        Task<PagedResult<NotificationDto>> GetUserNotificationsAsync(Guid userId, int pageNumber, int pageSize);
        Task MarkAsReadAsync(Guid id, Guid userId);
    }
}
