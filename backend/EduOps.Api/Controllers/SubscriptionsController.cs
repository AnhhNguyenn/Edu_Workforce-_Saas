using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Billing.Requests;
using EduOps.Application.DTOs.Billing.Responses;
using EduOps.Application.DTOs.Subscription;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduOps.Api.Authorization;

namespace EduOps.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EduOps.Api.Filters.FeatureGate("ENABLE_FINANCE")]
    public class SubscriptionsController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionsController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        [HttpGet("plans")]
        public async Task<IActionResult> GetPlans()
        {
            var result = await _subscriptionService.GetPlansAsync();
            return Ok(result);
        }

        [HttpPost("plans")]
        [HasPermission("Subscriptions:Manage")]
        public async Task<IActionResult> CreatePlan([FromBody] CreateSubscriptionPlanRequestDto request)
        {
            var result = await _subscriptionService.CreatePlanAsync(request);
            return Ok(result);
        }

        [HttpPut("plans/{id}")]
        [HasPermission("Subscriptions:Manage")]
        public async Task<IActionResult> UpdatePlan(Guid id, [FromBody] UpdateSubscriptionPlanRequestDto request)
        {
            await _subscriptionService.UpdatePlanAsync(id, request);
            return NoContent();
        }

        [HttpDelete("plans/{id}")]
        [HasPermission("Subscriptions:Manage")]
        public async Task<IActionResult> DeletePlan(Guid id)
        {
            await _subscriptionService.DeletePlanAsync(id);
            return NoContent();
        }

        [HttpGet("promotions")]
        [HasPermission("Subscriptions:Manage")]
        public async Task<IActionResult> GetPromotions()
        {
            var result = await _subscriptionService.GetPromotionsAsync();
            return Ok(result);
        }

        [HttpPost("promotions")]
        [HasPermission("Subscriptions:Manage")]
        public async Task<IActionResult> CreatePromotion([FromBody] CreatePromotionRequestDto request)
        {
            var result = await _subscriptionService.CreatePromotionAsync(request);
            return Ok(result);
        }

        [HttpPut("promotions/{id}")]
        [HasPermission("Subscriptions:Manage")]
        public async Task<IActionResult> UpdatePromotion(Guid id, [FromBody] UpdatePromotionRequestDto request)
        {
            await _subscriptionService.UpdatePromotionAsync(id, request);
            return NoContent();
        }

        [HttpDelete("promotions/{id}")]
        [HasPermission("Subscriptions:Manage")]
        public async Task<IActionResult> DeletePromotion(Guid id)
        {
            await _subscriptionService.DeletePromotionAsync(id);
            return NoContent();
        }

        [HttpGet("promotions/{id}/history")]
        [HasPermission("Subscriptions:Manage")]
        public async Task<IActionResult> GetPromotionHistory(Guid id)
        {
            var result = await _subscriptionService.GetPromotionUsageHistoryAsync(id);
            return Ok(result);
        }

        [HttpPost("subscribe")]
        [HasPermission("Subscriptions:Manage")]
        public async Task<IActionResult> Subscribe([FromBody] SubscribeRequestDto request)
        {
            var result = await _subscriptionService.SubscribeAsync(request);
            return Ok(result);
        }

        [HttpPost("preview-subscribe")]
        [HasPermission("Subscriptions:Manage")]
        public async Task<IActionResult> PreviewSubscribe([FromBody] SubscribeRequestDto request)
        {
            var result = await _subscriptionService.PreviewSubscribeAsync(request);
            return Ok(result);
        }

        [HttpGet("my-subscription")]
        [HasPermission("Subscriptions:Manage")]
        public async Task<IActionResult> GetMySubscription()
        {
            var result = await _subscriptionService.GetMySubscriptionAsync();
            return Ok(result);
        }

        [HttpGet("my-transactions")]
        [HasPermission("Subscriptions:Manage")]
        public async Task<IActionResult> GetMyTransactions()
        {
            var result = await _subscriptionService.GetMyTransactionsAsync();
            return Ok(result);
        }

        [HttpGet("transactions")]
        [HasPermission("Subscriptions:Manage")]
        public async Task<IActionResult> GetAllTransactions()
        {
            var result = await _subscriptionService.GetAllTransactionsAsync();
            return Ok(result);
        }

        [HttpGet("{referenceCode}/status")]
        [Authorize]
        public async Task<IActionResult> GetTransactionStatus(string referenceCode)
        {
            var status = await _subscriptionService.GetTransactionStatusAsync(referenceCode);
            return Ok(new { status = status, message = "Retrieved transaction status successfully." });
        }

        [HttpPost("{referenceCode}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelTransaction(string referenceCode)
        {
            await _subscriptionService.CancelTransactionAsync(referenceCode);
            return Ok(new { status = "Cancelled", message = "Transaction cancelled successfully." });
        }
    }
}
