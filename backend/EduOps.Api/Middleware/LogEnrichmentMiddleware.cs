using Microsoft.AspNetCore.Http;
using Serilog.Context;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;

namespace EduOps.Api.Middleware
{
    public class LogEnrichmentMiddleware
    {
        private readonly RequestDelegate _next;

        public LogEnrichmentMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var userId = context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? "Anonymous";
            var userEmail = context.User?.FindFirstValue(ClaimTypes.Email) ?? "N/A";
            var orgId = context.User?.FindFirstValue("OrganizationId") ?? "System";
            
            var clientIp = context.Request.Headers["CF-Connecting-IP"].FirstOrDefault() 
                           ?? context.Request.Headers["X-Forwarded-For"].FirstOrDefault() 
                           ?? context.Connection.RemoteIpAddress?.ToString() 
                           ?? "Unknown IP";

            var userAgent = context.Request.Headers["User-Agent"].ToString();
            if (string.IsNullOrEmpty(userAgent)) userAgent = "Unknown Device";

            using (LogContext.PushProperty("UserId", userId))
            using (LogContext.PushProperty("UserEmail", userEmail))
            using (LogContext.PushProperty("OrgId", orgId))
            using (LogContext.PushProperty("ClientIp", clientIp))
            using (LogContext.PushProperty("UserAgent", userAgent))
            {
                await _next(context);
            }
        }
    }
}
