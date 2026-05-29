using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduOps.Application.Interfaces;

namespace EduOps.Api.Controllers
{
    [Route("api/sepay")]
    [ApiController]
    public class SePayWebhookController : ControllerBase
    {
        private readonly ISePayService _sePayService;
        private readonly Microsoft.Extensions.Configuration.IConfiguration _config;

        public SePayWebhookController(ISePayService sePayService, Microsoft.Extensions.Configuration.IConfiguration config)
        {
            _sePayService = sePayService;
            _config = config;
        }

        // IPN Endpoint: https://yoursite.com/sepay/ipn
        [HttpPost("ipn")]
        public async Task<IActionResult> ReceiveIpn([FromQuery] string token, [FromBody] EduOps.Application.DTOs.Billing.SePayWebhookDto payload)
        {
            var expectedToken = _config["SePay:WebhookToken"];
            if (string.IsNullOrEmpty(token) || token != expectedToken)
            {
                return Unauthorized(new { message = "Invalid Webhook Token" });
            }

            // SePay sẽ gọi vào đây khi có giao dịch chuyển khoản thành công
            await _sePayService.HandleWebhookAsync(payload);
            return Ok(new { status = "success" });
        }
    }
}
