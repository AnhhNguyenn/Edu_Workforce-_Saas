using System.Threading.Tasks;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace EduOps.Api.Filters
{
    public class FeatureGateFilter : IAsyncActionFilter
    {
        private readonly string _featureKey;
        private readonly ISystemSettingService _settingService;

        public FeatureGateFilter(string featureKey, ISystemSettingService settingService)
        {
            _featureKey = featureKey;
            _settingService = settingService;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            bool isEnabled = await _settingService.IsFeatureEnabledAsync(_featureKey);

            if (!isEnabled)
            {
                context.Result = new ObjectResult(new { message = "Tính năng này đang được bảo trì hoặc tạm khóa bởi Quản trị viên." })
                {
                    StatusCode = 403
                };
                return;
            }

            await next();
        }
    }
}
