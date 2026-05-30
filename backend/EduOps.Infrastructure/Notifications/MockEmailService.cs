using System.Threading.Tasks;
using EduOps.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace EduOps.Infrastructure.Notifications
{
    public class MockEmailService : IEmailService
    {
        private readonly ILogger<MockEmailService> _logger;

        public MockEmailService(ILogger<MockEmailService> logger)
        {
            _logger = logger;
        }

        public Task SendEmailAsync(string to, string subject, string body)
        {
            _logger.LogInformation("\n========== MOCK EMAIL SENT ==========\nTo: {To}\nSubject: {Subject}\nBody: {Body}\n======================================\n", 
                to, subject, body);
            
            return Task.CompletedTask;
        }
    }
}
