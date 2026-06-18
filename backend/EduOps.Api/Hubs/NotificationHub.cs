using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace EduOps.Api.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            }

            var orgId = Context.User?.FindFirst("OrganizationId")?.Value;
            if (!string.IsNullOrEmpty(orgId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"ORG_{orgId}");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
            }

            var orgId = Context.User?.FindFirst("OrganizationId")?.Value;
            if (!string.IsNullOrEmpty(orgId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"ORG_{orgId}");
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
