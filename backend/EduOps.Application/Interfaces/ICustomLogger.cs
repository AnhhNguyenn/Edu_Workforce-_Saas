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
    }
}
