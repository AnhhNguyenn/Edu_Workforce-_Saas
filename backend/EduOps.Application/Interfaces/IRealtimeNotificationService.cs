using System;
using System.Threading.Tasks;

namespace EduOps.Application.Interfaces
{
    public interface IRealtimeNotificationService
    {
        Task SendToUserAsync(Guid userId, string messageType, object payload);
        Task SendToAllAsync(string messageType, object? payload = null);
        Task SendToOrganizationAsync(Guid orgId, string messageType, object? payload = null);
    }
}
