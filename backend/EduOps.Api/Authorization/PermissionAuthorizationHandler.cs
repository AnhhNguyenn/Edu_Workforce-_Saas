using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using EduOps.Application.Interfaces;
using EduOps.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace EduOps.Api.Authorization
{
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public PermissionAuthorizationHandler(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            if (context.User.Identity == null || !context.User.Identity.IsAuthenticated) return;

            var roles = context.User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();
            if (!roles.Any()) return;

            if (roles.Contains("SUPER_ADMIN"))
            {
                context.Succeed(requirement);
                return;
            }

            using var scope = _scopeFactory.CreateScope();
            var cacheService = scope.ServiceProvider.GetRequiredService<ICacheService>();
            var dbContext = scope.ServiceProvider.GetRequiredService<EduOpsDbContext>();

            bool hasPermission = false;

            foreach (var role in roles)
            {
                var cacheKey = $"role:{role}:permissions_v3";
                var permissionsStr = await cacheService.GetAsync<string>(cacheKey);

                if (string.IsNullOrEmpty(permissionsStr))
                {
                    var roleEntity = await dbContext.Roles
                        .Include(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
                        .FirstOrDefaultAsync(r => r.Name == role);

                    if (roleEntity != null)
                    {
                        var perms = roleEntity.RolePermissions.Where(rp => rp.Permission != null).Select(rp => $"{rp.Permission!.Module}:{rp.Permission!.Action}").ToList();
                        permissionsStr = string.Join(",", perms);
                        await cacheService.SetAsync(cacheKey, permissionsStr, System.TimeSpan.FromHours(12));
                    }
                    else
                    {
                        permissionsStr = "NONE";
                    }
                }

                if (permissionsStr != "NONE" && permissionsStr.Contains(requirement.Permission))
                {
                    hasPermission = true;
                    break;
                }
            }

            if (hasPermission)
            {
                context.Succeed(requirement);
            }
        }
    }
}
