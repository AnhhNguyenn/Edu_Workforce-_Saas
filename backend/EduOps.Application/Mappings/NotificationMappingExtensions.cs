using EduOps.Application.DTOs.Notification;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class NotificationMappingExtensions
    {
        public static NotificationDto ToDto(this Notification notif)
        {
            if (notif == null) return null!;

            return new NotificationDto
            {
                Id = notif.Id,
                UserId = notif.UserId,
                Title = notif.Title,
                Message = notif.Message,
                TypeId = notif.TypeId,
                TypeCode = notif.Type?.Code ?? string.Empty,
                IsRead = notif.IsRead,
                CreatedAt = notif.CreatedAt
            };
        }
    }
}
