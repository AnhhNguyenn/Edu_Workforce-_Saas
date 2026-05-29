using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduOps.Application.DTOs.Billing;
using EduOps.Application.Interfaces;

namespace EduOps.Api.Controllers
{
    [Route("api/subscriptions")]
    [ApiController]
    public class SubscriptionsController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;
        private readonly ICurrentUserService _currentUserService;

        public SubscriptionsController(ISubscriptionService subscriptionService, ICurrentUserService currentUserService)
        {
            _subscriptionService = subscriptionService;
            _currentUserService = currentUserService;
        }

        // --- PUBLIC HOẶC CENTER ADMIN ---
        [HttpGet("plans")]
        public async Task<IActionResult> GetPlans()
        {
            return Ok(await _subscriptionService.GetPlansAsync());
        }

        [HttpPost("subscribe")]
        [Authorize(Roles = "CENTER_ADMIN")]
        public async Task<IActionResult> Subscribe([FromBody] SubscribeRequestDto request)
        {
            var orgId = _currentUserService.OrganizationId;
            if (!orgId.HasValue || orgId == Guid.Empty) return BadRequest("Invalid organization.");

            var result = await _subscriptionService.SubscribeAsync(orgId.Value, request);
            return Ok(new { message = result });
        }

        // --- SUPER ADMIN ---
        [HttpPost("plans")]
        [Authorize(Roles = "SUPER_ADMIN")]
        public async Task<IActionResult> CreatePlan([FromBody] SubscriptionPlanRequestDto request)
        {
            return Ok(await _subscriptionService.CreatePlanAsync(request));
        }

        [HttpGet("promotions")]
        [Authorize(Roles = "SUPER_ADMIN")]
        public async Task<IActionResult> GetPromotions()
        {
            return Ok(await _subscriptionService.GetPromotionsAsync());
        }

        [HttpPost("promotions")]
        [Authorize(Roles = "SUPER_ADMIN")]
        public async Task<IActionResult> CreatePromotion([FromBody] PromotionRequestDto request)
        {
            return Ok(await _subscriptionService.CreatePromotionAsync(request));
        }
    }
}
