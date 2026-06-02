using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace EduOps.Api.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ICustomLogger _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ICustomLogger logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred during request processing.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var statusCode = HttpStatusCode.InternalServerError;
            var message = "Internal Server Error from the custom middleware.";

            if (exception is BaseCustomException customEx)
            {
                statusCode = customEx.StatusCode;
                message = customEx.Message;
            }
            else if (exception is UnauthorizedAccessException unauthEx)
            {
                statusCode = HttpStatusCode.Unauthorized;
                message = unauthEx.Message;
            }

            context.Response.StatusCode = (int)statusCode;

            var result = JsonSerializer.Serialize(new
            {
                StatusCode = context.Response.StatusCode,
                Message = message,
                Detail = exception.InnerException?.Message
            });

            return context.Response.WriteAsync(result);
        }
    }
}
