using System;
using System.IO;
using System.Threading.Tasks;
using EduOps.Api.Attributes;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Logging;

namespace EduOps.Api.Middleware
{
    public class IdempotencyMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<IdempotencyMiddleware> _logger;

        public IdempotencyMiddleware(RequestDelegate next, ILogger<IdempotencyMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ICacheService cacheService)
        {
            var endpoint = context.Features.Get<IEndpointFeature>()?.Endpoint;
            if (endpoint == null)
            {
                await _next(context);
                return;
            }

            var idempotentAttribute = endpoint.Metadata.GetMetadata<IdempotentAttribute>();
            if (idempotentAttribute == null)
            {
                await _next(context);
                return;
            }

            if (!context.Request.Headers.TryGetValue("X-Idempotency-Key", out var idempotencyKey))
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsJsonAsync(new { message = "Header X-Idempotency-Key is required for this operation." });
                return;
            }

            var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "anonymous";
            var cacheKey = $"idempotency:{userId}:{idempotencyKey}";

            var cachedResponse = await cacheService.GetAsync<string>(cacheKey);
            if (!string.IsNullOrEmpty(cachedResponse))
            {
                _logger.LogInformation("Idempotency Triggered! Returning cached response for Key {Key} (User {UserId})", idempotencyKey, userId);
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = 200;
                await context.Response.WriteAsync(cachedResponse);
                return;
            }

            // Capture the response
            var originalBodyStream = context.Response.Body;
            using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            await _next(context);

            if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 300)
            {
                context.Response.Body.Seek(0, SeekOrigin.Begin);
                var text = await new StreamReader(context.Response.Body).ReadToEndAsync();
                context.Response.Body.Seek(0, SeekOrigin.Begin);

                // Cache for 24 hours to prevent double-execution
                await cacheService.SetAsync(cacheKey, text, TimeSpan.FromHours(24));
            }

            await responseBody.CopyToAsync(originalBodyStream);
        }
    }
}
