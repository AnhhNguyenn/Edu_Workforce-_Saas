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

        public void LogBusinessEvent(string logCategory, string message, params object[] args)
        {
            using (Serilog.Context.LogContext.PushProperty("LogCategory", logCategory))
            {
                _logger.LogInformation(message, args);
            }
        }

        public void LogAuditCreate(string entityName, string entityId, string details)
        {
            using (Serilog.Context.LogContext.PushProperty("LogCategory", "Audit_Create"))
            {
                _logger.LogInformation($"[Create] {entityName} (ID: {entityId}) - {details}");
            }
        }

        public void LogAuditRead(string entityName, string details)
        {
            using (Serilog.Context.LogContext.PushProperty("LogCategory", "Audit_Read"))
            {
                _logger.LogInformation($"[Read] {entityName} - {details}");
            }
        }

        public void LogAuditUpdate(string entityName, string entityId, string details)
        {
            using (Serilog.Context.LogContext.PushProperty("LogCategory", "Audit_Update"))
            {
                _logger.LogInformation($"[Update] {entityName} (ID: {entityId}) - {details}");
            }
        }

        public void LogAuditDelete(string entityName, string entityId, string details)
        {
            using (Serilog.Context.LogContext.PushProperty("LogCategory", "Audit_Delete"))
            {
                _logger.LogInformation($"[Delete] {entityName} (ID: {entityId}) - {details}");
            }
        }

        public void LogAuth(string message, params object[] args)
        {
            using (Serilog.Context.LogContext.PushProperty("LogCategory", "Auth"))
            {
                _logger.LogInformation(message, args);
            }
        }

        public void LogPayment(string message, params object[] args)
        {
            using (Serilog.Context.LogContext.PushProperty("LogCategory", "Payment"))
            {
                _logger.LogInformation(message, args);
            }
        }

        public void LogIntegration(string serviceName, string message, params object[] args)
        {
            using (Serilog.Context.LogContext.PushProperty("LogCategory", "Integration"))
            {
                _logger.LogInformation($"[{serviceName}] {message}", args);
            }
        }

        public void LogBackground(string jobName, string message, params object[] args)
        {
            using (Serilog.Context.LogContext.PushProperty("LogCategory", "Background"))
            {
                _logger.LogInformation($"[Job: {jobName}] {message}", args);
            }
        }
    }
}
