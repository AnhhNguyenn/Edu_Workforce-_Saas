using System;
using System.Threading.Tasks;

namespace EduOps.Application.Interfaces
{
    public interface IRealtimeNotificationService
    {
        Task SendToUserAsync(Guid userId, string messageType, object payload);
        Task SendToAllAsync(string messageType, object? payload = null);
    }
}
