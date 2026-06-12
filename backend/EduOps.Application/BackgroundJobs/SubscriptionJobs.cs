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

        public SubscriptionJobs(IUnitOfWork unitOfWork, ICustomLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task CancelExpiredTransactionsAsync()
        {
            try
            {
                var pendingStatus = await _unitOfWork.Repository<BillingStatus>().FirstOrDefaultAsync(s => s.Code == "PENDING");
                var failedStatus = await _unitOfWork.Repository<BillingStatus>().FirstOrDefaultAsync(s => s.Code == "FAILED");

                if (pendingStatus == null || failedStatus == null) return;

                var timeoutThreshold = DateTime.UtcNow.AddMinutes(-30);

                var expiredTransactions = await _unitOfWork.Repository<BillingTransaction>().FindAsync(
                    t => t.StatusId == pendingStatus.Id && t.PaymentDate < timeoutThreshold
                );

                if (!expiredTransactions.Any()) return;

                foreach (var tx in expiredTransactions)
                {
                    tx.StatusId = failedStatus.Id;
                    _unitOfWork.Repository<BillingTransaction>().Update(tx);
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
