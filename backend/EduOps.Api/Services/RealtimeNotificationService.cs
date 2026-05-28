using EduOps.Application.Interfaces;
using EduOps.Api.Hubs;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace EduOps.Api.Services
{
    public class RealtimeNotificationService : IRealtimeNotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public RealtimeNotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendToUserAsync(Guid userId, string messageType, object payload)
        {
            // Bắn event tới chính xác Group mang ID của User
            await _hubContext.Clients.Group(userId.ToString()).SendAsync(messageType, payload);
        }
    }
}
