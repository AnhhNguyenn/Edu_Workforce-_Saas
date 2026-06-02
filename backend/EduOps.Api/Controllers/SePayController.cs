using System.Threading.Tasks;
using EduOps.Application.DTOs.SePay;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace EduOps.Api.Controllers
{
    [Route("api/sepay")]
    [ApiController]
    [EduOps.Api.Filters.FeatureGate("ENABLE_FINANCE")]
    public class SePayController : ControllerBase
    {
        private readonly ISePayService _sePayService;
        private readonly IConfiguration _configuration;

        public SePayController(ISePayService sePayService, IConfiguration configuration)
        {
            _sePayService = sePayService;
            _configuration = configuration;
        }

        [AllowAnonymous]
        [HttpPost("ipn")]
        public async Task<IActionResult> ReceiveWebhook([FromBody] SePayWebhookDto payload)
        {
            // Bảo vệ Webhook bằng API Key (Tránh Hacker bơm tiền giả)
            var expectedToken = _configuration["SePay:WebhookToken"];

            // Lấy token từ Header (Ví dụ: Authorization: Bearer <token> hoặc x-sepay-token)
            var authHeader = Request.Headers["Authorization"].ToString();
            var sePayHeader = Request.Headers["x-sepay-token"].ToString();

            var providedToken = !string.IsNullOrEmpty(sePayHeader)
                ? sePayHeader
                : (authHeader.StartsWith("Bearer ") ? authHeader.Substring(7) : string.Empty);

            if (string.IsNullOrEmpty(expectedToken) || providedToken != expectedToken)
            {
                return Unauthorized(new { success = false, message = "Invalid API Token" });
            }

            var result = await _sePayService.ProcessWebhookAsync(payload);
            return Ok(result);
        }
    }
}
