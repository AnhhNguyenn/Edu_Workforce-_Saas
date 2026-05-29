using System;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.Interfaces;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.BackgroundJobs
{
    public class NotificationJobs
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;
        private readonly ICustomLogger _logger;

        public NotificationJobs(IUnitOfWork unitOfWork, INotificationService notificationService, ICustomLogger logger)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _logger = logger;
        }

        // Job quét và nhắc lịch dạy cho ngày mai
        public async Task SendDailyRemindersAsync()
        {
            _logger.LogInformation("Cronjob 'SendDailyReminders' is starting...");

            var tomorrow = DateTime.UtcNow.Date.AddDays(1);
            var sessionRepo = _unitOfWork.Repository<Session>();
            
            var tomorrowSessions = await sessionRepo.FindAsync(s => s.SessionDate.Date == tomorrow && s.Status == EduOps.Domain.Enums.SessionStatus.SCHEDULED);

            foreach (var session in tomorrowSessions)
            {
                var timeStr = session.StartTime.ToString(@"hh\:mm");
                // Gửi cho Giáo viên
                await _notificationService.CreateAndSendAsync(
                    session.TeacherId, 
                    "Nhắc nhở lịch dạy", 
                    $"Bạn có lịch dạy bài '{session.LessonTitle}' vào lúc {timeStr} sáng mai.", 
                    "REMINDER"
                );

                // Gửi cho Trợ giảng (nếu có)
                if (session.AssistantId.HasValue)
                {
                    await _notificationService.CreateAndSendAsync(
                        session.AssistantId.Value, 
                        "Nhắc nhở lịch trợ giảng", 
                        $"Bạn có lịch làm trợ giảng bài '{session.LessonTitle}' vào lúc {timeStr} sáng mai.", 
                        "REMINDER"
                    );
                }
            }

            _logger.LogInformation($"Cronjob 'SendDailyReminders' completed. Sent {tomorrowSessions.Count()} reminders.");
        }
    }
}
