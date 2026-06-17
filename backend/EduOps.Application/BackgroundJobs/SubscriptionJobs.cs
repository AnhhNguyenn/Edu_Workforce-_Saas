using System;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.Interfaces;
using EduOps.Domain.Interfaces;
using EduOps.Domain.Entities;

namespace EduOps.Application.BackgroundJobs
{
    public class SubscriptionJobs
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICustomLogger _logger;
        private readonly INotificationService _notificationService;

        public SubscriptionJobs(IUnitOfWork unitOfWork, ICustomLogger logger, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _notificationService = notificationService;
        }

        public async Task CancelExpiredTransactionsAsync()
        {
            try
            {
                var pendingStatus = await _unitOfWork.Repository<BillingStatus>().FirstOrDefaultAsync(s => s.Code == "PENDING");
                var failedStatus = await _unitOfWork.Repository<BillingStatus>().FirstOrDefaultAsync(s => s.Code == "FAILED");

                if (pendingStatus == null || failedStatus == null) return;

                var timeoutThreshold = DateTime.UtcNow.AddMinutes(-10);

                var expiredTransactions = await _unitOfWork.Repository<BillingTransaction>().FindAsync(
                    t => t.StatusId == pendingStatus.Id && t.PaymentDate < timeoutThreshold
                );

                if (!expiredTransactions.Any()) return;

                foreach (var tx in expiredTransactions)
                {
                    tx.StatusId = failedStatus.Id;
                    _unitOfWork.Repository<BillingTransaction>().Update(tx);

                    // Send notification to CENTER_ADMIN
                    if (tx.OrganizationId.HasValue)
                    {
                        var admins = await _unitOfWork.Repository<User>().FindAsync(u => u.OrganizationId == tx.OrganizationId.Value && u.Role != null && u.Role.Code == "CENTER_ADMIN", includeProperties: "Role");
                        foreach (var admin in admins)
                        {
                            await _notificationService.CreateAndSendAsync(
                                admin.Id,
                                "Thanh toán quá hạn",
                                $"Giao dịch thanh toán gói cước {tx.PlanName} đã bị hủy do quá thời gian chờ 10 phút.",
                                "BILLING"
                            );
                        }
                    }
                }

                await _unitOfWork.CommitAsync();
                
                _logger.LogInformation($"[SubscriptionJobs] Cancelled {expiredTransactions.Count()} expired pending transactions.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SubscriptionJobs] Failed to cancel expired transactions.");
            }
        }
    }
}
