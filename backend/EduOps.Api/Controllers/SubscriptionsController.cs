using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Billing.Requests;
using EduOps.Application.DTOs.Billing.Responses;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace EduOps.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
        [Authorize(Roles = "SUPER_ADMIN")]
        public async Task<IActionResult> CreatePlan([FromBody] CreateSubscriptionPlanRequestDto request)
        {
            var result = await _subscriptionService.CreatePlanAsync(request);
            return Ok(result);
        }

        [HttpGet("promotions")]
        [Authorize(Roles = "SUPER_ADMIN")]
        public async Task<IActionResult> GetPromotions()
        {
            var result = await _subscriptionService.GetPromotionsAsync();
            return Ok(result);
        }

        [HttpPost("promotions")]
        [Authorize(Roles = "SUPER_ADMIN")]
        public async Task<IActionResult> CreatePromotion([FromBody] CreatePromotionRequestDto request)
        {
            var result = await _subscriptionService.CreatePromotionAsync(request);
            return Ok(result);
        }

        [HttpPost("subscribe")]
        [Authorize(Roles = "CENTER_ADMIN")]
        public async Task<IActionResult> Subscribe([FromBody] SubscribeRequestDto request)
        {
            var result = await _subscriptionService.SubscribeAsync(request);
            return Ok(result);
        }

        [HttpGet("my-subscription")]
        [Authorize(Roles = "CENTER_ADMIN")]
        public async Task<IActionResult> GetMySubscription()
        {
            var result = await _subscriptionService.GetMySubscriptionAsync();
            return Ok(result);
        }

        [HttpGet("my-transactions")]
        [Authorize(Roles = "CENTER_ADMIN")]
        public async Task<IActionResult> GetMyTransactions()
        {
            var result = await _subscriptionService.GetMyTransactionsAsync();
            return Ok(result);
        }

        [HttpGet("transactions/{refCode}/status")]
        [Authorize(Roles = "CENTER_ADMIN")]
        public async Task<IActionResult> GetTransactionStatus(string refCode)
        {
            var status = await _subscriptionService.GetTransactionStatusAsync(refCode);
            return Ok(new { ReferenceCode = refCode, Status = status });
        }
    }
}
