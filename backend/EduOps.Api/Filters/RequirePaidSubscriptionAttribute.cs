using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;
using EduOps.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace EduOps.Api.Filters
{
    public class CachedOrgStatus
    {
        public string? Status { get; set; }
        public DateTime? EndDate { get; set; }
        public string? OrgStatus { get; set; }
    }

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
            var cache = context.HttpContext.RequestServices.GetService<ICacheService>();

            var orgId = currentUserService?.OrganizationId;
            if (orgId.HasValue && orgId != Guid.Empty)
            {
                var cacheKey = $"OrgSubscription_{orgId.Value}";

                var cachedData = cache != null ? await cache.GetAsync<CachedOrgStatus>(cacheKey) : null;
                
                if (cachedData == null)
                {
                    var orgRepo = unitOfWork?.Repository<Organization>();
                    var org = orgRepo != null ? await orgRepo.FirstOrDefaultAsync(o => o.Id == orgId.Value, includeProperties: "Status") : null;

                    cachedData = new CachedOrgStatus();
                    if (org != null)
                    {
                        bool isExpiredCheck = org.SubscriptionEnd.HasValue && org.SubscriptionEnd.Value < DateTime.UtcNow;
                        if (isExpiredCheck && org.SubscriptionStatus != "EXPIRED" && org.SubscriptionStatus != "LOCKED")
                        {
                            org.SubscriptionStatus = "EXPIRED";
                            orgRepo?.Update(org);
                            if (unitOfWork != null) await unitOfWork.CommitAsync();
                        }
                        cachedData.Status = org.SubscriptionStatus;
                        cachedData.EndDate = org.SubscriptionEnd;
                        cachedData.OrgStatus = org.Status?.Code;
                    }

                    if (cache != null)
                    {
                        await cache.SetAsync(cacheKey, cachedData, TimeSpan.FromMinutes(5));
                    }
                }

                if (cachedData.OrgStatus == "SUSPENDED" || cachedData.OrgStatus == "INACTIVE")
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

                    // Nếu gói bị khóa, hết hạn hoặc chưa thanh toán (tắt dùng thử) -> Chặn đứng
                    if (isExpired || cachedData.Status == "LOCKED" || cachedData.Status == "EXPIRED" || cachedData.Status == "UNPAID")
                    {
                        context.Result = new ObjectResult(new
                        {
                            errorCode = "403_SUBSCRIPTION_REQUIRED",
                            message = "Tài khoản của bạn chưa mua gói, đã bị khóa hoặc hết hạn. Vui lòng thanh toán nâng cấp gói cước để sử dụng tính năng này."
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
