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
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class RequirePaidSubscriptionAttribute : ActionFilterAttribute, IAsyncActionFilter
    {
        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var currentUserService = context.HttpContext.RequestServices.GetService<ICurrentUserService>();
            var unitOfWork = context.HttpContext.RequestServices.GetService<IUnitOfWork>();

            var orgId = currentUserService?.OrganizationId;
            if (orgId.HasValue && orgId != Guid.Empty)
            {
                var orgRepo = unitOfWork?.Repository<Organization>();
                var org = orgRepo != null ? await orgRepo.GetByIdAsync(orgId.Value) : null;
                
                if (org != null)
                {
                    bool isExpired = org.SubscriptionEnd.HasValue && org.SubscriptionEnd.Value < DateTime.UtcNow;

                    // Nếu gói bị khóa hoặc hết hạn -> Chặn đứng
                    if (isExpired || org.SubscriptionStatus == "LOCKED" || 
                        org.SubscriptionStatus == "EXPIRED" || 
                        org.SubscriptionStatus == "TRIAL")
                    {
                        // Auto update DB to EXPIRED if it was past time
                        if (isExpired && org.SubscriptionStatus != "EXPIRED" && org.SubscriptionStatus != "LOCKED")
                        {
                            org.SubscriptionStatus = "EXPIRED";
                            orgRepo?.Update(org);
                            if (unitOfWork != null) await unitOfWork.CommitAsync();
                        }

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
