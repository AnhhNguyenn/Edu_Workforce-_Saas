using System;
using System.Security.Claims;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace EduOps.Api.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid UserId
        {
            get
            {
                var idStr = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
                return Guid.TryParse(idStr, out var id) ? id : Guid.Empty;
            }
        }

        public Guid? OrganizationId
        {
            get
            {
                var orgIdStr = _httpContextAccessor.HttpContext?.User?.FindFirstValue("OrganizationId");
                return Guid.TryParse(orgIdStr, out var orgId) ? orgId : null;
            }
        }

        public string Role => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
    }
}
