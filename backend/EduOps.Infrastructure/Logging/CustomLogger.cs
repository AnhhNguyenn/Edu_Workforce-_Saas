using System;
using EduOps.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace EduOps.Infrastructure.Logging
{
    public class CustomLogger<T> : ICustomLogger
    {
        private readonly ILogger<T> _logger;

        public CustomLogger(ILogger<T> logger)
        {
            _logger = logger;
        }

        public void LogInformation(string message, params object[] args)
        {
            _logger.LogInformation(message, args);
        }

        public void LogWarning(string message, params object[] args)
        {
            _logger.LogWarning(message, args);
        }

        public void LogError(Exception ex, string message, params object[] args)
        {
            _logger.LogError(ex, message, args);
        }

        public void LogCritical(Exception ex, string message, params object[] args)
        {
            _logger.LogCritical(ex, message, args);
        }
    }
}
