using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;

namespace EduOps.Api.Filters
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = true, AllowMultiple = true)]
    public class RequirePermissionAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string _module;
        private readonly string _action;

        public RequirePermissionAttribute(string module, string action)
        {
            _module = module;
            _action = action;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (user == null || !user.Identity!.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // SUPER_ADMIN có toàn quyền, không cần check Permission chi tiết
            var roleCode = user.FindFirst("role")?.Value ?? user.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (roleCode == "SUPER_ADMIN")
            {
                return;
            }

            var userIdString = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? user.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (!Guid.TryParse(userIdString, out Guid userId))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Lấy UnitOfWork từ DI
            var unitOfWork = context.HttpContext.RequestServices.GetRequiredService<IUnitOfWork>();
            var userRepository = unitOfWork.Repository<User>();
            
            var currentUser = await userRepository.FirstOrDefaultAsync(
                u => u.Id == userId,
                includeProperties: "Role,Role.RolePermissions,Role.RolePermissions.Permission"
            );

            if (currentUser?.Role == null)
            {
                context.Result = new ForbidResult();
                return;
            }

            // CENTER_ADMIN mặc định có toàn quyền trong phạm vi Organization của mình (Tùy chọn)
            if (currentUser.Role.Code == "CENTER_ADMIN")
            {
                return;
            }

            var hasPermission = currentUser.Role.RolePermissions?
                .Any(rp => rp.Permission != null && rp.Permission.Module == _module && rp.Permission.Action == _action) ?? false;

            if (!hasPermission)
            {
                context.Result = new ForbidResult();
            }
        }
    }
}
