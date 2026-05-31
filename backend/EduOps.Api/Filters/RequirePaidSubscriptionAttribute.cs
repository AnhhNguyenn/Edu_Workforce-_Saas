using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;
using EduOps.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Caching.Memory;

namespace EduOps.Api.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class RequirePaidSubscriptionAttribute : ActionFilterAttribute, IAsyncActionFilter
    {
        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // Cho phép các request GET (chỉ đọc) đi qua tường phí
            if (Microsoft.AspNetCore.Http.HttpMethods.IsGet(context.HttpContext.Request.Method))
            {
                await next();
                return;
            }

            var currentUserService = context.HttpContext.RequestServices.GetService<ICurrentUserService>();
            var unitOfWork = context.HttpContext.RequestServices.GetService<IUnitOfWork>();
            var cache = context.HttpContext.RequestServices.GetService<Microsoft.Extensions.Caching.Memory.IMemoryCache>();

            var orgId = currentUserService?.OrganizationId;
            if (orgId.HasValue && orgId != Guid.Empty)
            {
                var cacheKey = $"OrgSubscription_{orgId.Value}";
                
                var cachedData = cache != null ? await cache.GetOrCreateAsync(cacheKey, async entry => 
                {
                    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
                    
                    var orgRepo = unitOfWork?.Repository<Organization>();
                    var org = orgRepo != null ? await orgRepo.GetByIdAsync(orgId.Value) : null;
                    
                    if (org != null)
                    {
                        bool isExpiredCheck = org.SubscriptionEnd.HasValue && org.SubscriptionEnd.Value < DateTime.UtcNow;
                        if (isExpiredCheck && org.SubscriptionStatus != "EXPIRED" && org.SubscriptionStatus != "LOCKED")
                        {
                            org.SubscriptionStatus = "EXPIRED";
                            orgRepo?.Update(org);
                            if (unitOfWork != null) await unitOfWork.CommitAsync();
                        }
                        return (Status: org.SubscriptionStatus, EndDate: org.SubscriptionEnd, OrgStatus: (EduOps.Domain.Enums.AccountStatus?)org.Status);
                    }
                    return (Status: (string?)null, EndDate: (DateTime?)null, OrgStatus: (EduOps.Domain.Enums.AccountStatus?)null);
                }) : (Status: (string?)null, EndDate: (DateTime?)null, OrgStatus: (EduOps.Domain.Enums.AccountStatus?)null);

                if (cachedData.OrgStatus == EduOps.Domain.Enums.AccountStatus.SUSPENDED || cachedData.OrgStatus == EduOps.Domain.Enums.AccountStatus.INACTIVE)
                {
                    context.Result = new ObjectResult(new 
                    { 
                        errorCode = "403_ORG_SUSPENDED",
                        message = "Trung tâm của bạn đã bị vô hiệu hóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ." 
                    }) 
                    { 
                        StatusCode = 403 
                    };
                    return;
                }

                if (cachedData.Status != null)
                {
                    bool isExpired = cachedData.EndDate.HasValue && cachedData.EndDate.Value < DateTime.UtcNow;

                    // Nếu gói bị khóa hoặc hết hạn -> Chặn đứng
                    if (isExpired || cachedData.Status == "LOCKED" || cachedData.Status == "EXPIRED")
                    {
                        context.Result = new ObjectResult(new 
                        { 
                            errorCode = "403_SUBSCRIPTION_REQUIRED",
                            message = "Tài khoản của bạn đã bị khóa hoặc hết hạn. Vui lòng thanh toán nâng cấp gói cước để sử dụng tính năng này." 
                        }) 
                        { 
                            StatusCode = 403 
                        };
                        return;
                    }
                }
            }

            await next();
        }
    }
}
