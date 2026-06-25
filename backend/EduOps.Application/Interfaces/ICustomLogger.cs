using System;
using System.Collections.Generic;

namespace EduOps.Application.Interfaces
{
    public interface ICustomLogger
    {
        void LogInformation(string message, params object[] args);
        void LogWarning(string message, params object[] args);
        void LogError(Exception ex, string message, params object[] args);
        void LogCritical(Exception ex, string message, params object[] args);

        // Chuẩn Audit (Truy vết Data)
        void LogAuditCreate(string entityName, string entityId, string details);
        void LogAuditRead(string entityName, string details);
        void LogAuditUpdate(string entityName, string entityId, string details);
        void LogAuditDelete(string entityName, string entityId, string details);

        // Chuẩn Nghiệp vụ (Business)
        void LogAuth(string message, params object[] args);
        void LogPayment(string message, params object[] args);
        void LogIntegration(string serviceName, string message, params object[] args);
        void LogBackground(string jobName, string message, params object[] args);
        void LogBusinessEvent(string logCategory, string message, params object[] args);
    }
}
