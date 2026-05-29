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

        // Job quét các gói cước để báo hết hạn & tự động khóa
        public async Task CheckSubscriptionExpiryAsync()
        {
            _logger.LogInformation("Cronjob 'CheckSubscriptionExpiry' is starting...");

            var orgRepo = _unitOfWork.Repository<Organization>();
            var userRepo = _unitOfWork.Repository<User>();
            var now = DateTime.UtcNow.Date;

            // Tìm các Organization đang ACTIVE và có ngày hết hạn
            var activeOrgs = await orgRepo.FindAsync(o => o.SubscriptionStatus == "ACTIVE" && o.SubscriptionEnd.HasValue);

            foreach (var org in activeOrgs)
            {
                try
                {
                    if (!org.SubscriptionEnd.HasValue) continue;
                    
                    var endDate = org.SubscriptionEnd.Value.Date;
                    var daysLeft = (endDate - now).Days;

                    if (daysLeft == 7 || daysLeft == 2 || daysLeft == 1)
                    {
                        // Lấy tất cả CENTER_ADMIN của trung tâm này
                        var admins = await userRepo.FindAsync(u => u.OrganizationId == org.Id && u.Role == "CENTER_ADMIN");
                        foreach (var admin in admins)
                        {
                            await _notificationService.CreateAndSendAsync(
                                admin.Id,
                                "Gói cước sắp hết hạn",
                                $"Gói cước của trung tâm '{org.Name}' sẽ hết hạn sau {daysLeft} ngày nữa. Vui lòng thanh toán gia hạn để không bị gián đoạn dịch vụ.",
                                "BILLING"
                            );
                        }
                    }
                    else if (daysLeft <= 0)
                    {
                        // Đã quá hạn -> Khóa
                        org.SubscriptionStatus = "EXPIRED";
                        orgRepo.Update(org);

                        var admins = await userRepo.FindAsync(u => u.OrganizationId == org.Id && u.Role == "CENTER_ADMIN");
                        foreach (var admin in admins)
                        {
                            await _notificationService.CreateAndSendAsync(
                                admin.Id,
                                "Gói cước đã hết hạn (Bị Khóa)",
                                $"Gói cước của trung tâm '{org.Name}' đã hết hạn. Hệ thống đã khóa các chức năng vận hành, vui lòng gia hạn ngay để mở khóa.",
                                "BILLING"
                            );
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Lỗi khi quét Gói cước cho Org {org.Id}: {ex.Message}");
                }
            }

            await _unitOfWork.CommitAsync();
            _logger.LogInformation("Cronjob 'CheckSubscriptionExpiry' completed.");
        }
    }
}
