using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using EduOps.Application.DTOs.SePay;
using EduOps.Application.Interfaces;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class SePayService : ISePayService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICustomLogger _logger;
        private readonly ICacheService _cache;
        private readonly INotificationService _notificationService;

        public SePayService(IUnitOfWork unitOfWork, ICustomLogger logger, ICacheService cache, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _cache = cache;
            _notificationService = notificationService;
        }

        public async Task<SePayResponseDto> ProcessWebhookAsync(SePayWebhookDto payload)
        {
            try
            {
                // Bước 1: Trích xuất ReferenceCode (Dùng Regex cứu hộ nếu AI của SePay parse hụt)
                string? refCode = payload.code;
                if (string.IsNullOrEmpty(refCode) || !refCode.StartsWith("EDU-"))
                {
                    var match = Regex.Match(payload.transactionContent, @"EDU-[A-Z0-9]{4}-\d{8}-[A-Z0-9]{8}");
                    if (match.Success)
                    {
                        refCode = match.Value;
                    }
                }

                if (string.IsNullOrEmpty(refCode))
                {
                    _logger.LogWarning($"[SePay] Không tìm thấy ReferenceCode hợp lệ trong nội dung: {payload.transactionContent}");
                    return new SePayResponseDto { success = true, message = "Ignored: No ReferenceCode" };
                }

                // ==========================================
                // KHÓA PHÂN TÁN (REDIS DISTRIBUTED LOCK)
                // Chống Race Condition: Ngân hàng dội 2 webhook cùng lúc
                // ==========================================
                var lockKey = $"Webhook_{refCode}";
                var lockAcquired = await _cache.AcquireLockAsync(lockKey, TimeSpan.FromSeconds(10)); // Khóa 10 giây
                
                if (!lockAcquired)
                {
                    _logger.LogWarning($"[SePay] Giao dịch {refCode} đang bị khóa bởi 1 webhook khác (Race condition prevented).");
                    return new SePayResponseDto { success = true, message = "Ignored: Locked by another process" };
                }

                try
                {
                    // Bước 2: Truy tìm Giao dịch. BẮT BUỘC DÙNG ignoreQueryFilters = true ĐỂ VƯỢT TƯỜNG LỬA MULTI-TENANT
                    var transactionRepo = _unitOfWork.Repository<BillingTransaction>();
                    var tx = await transactionRepo.FirstOrDefaultAsync(t => t.ReferenceCode == refCode, ignoreQueryFilters: true);

                    if (tx == null)
                    {
                        _logger.LogWarning($"[SePay] Không tìm thấy Giao dịch với mã: {refCode}");
                        return new SePayResponseDto { success = true, message = "Ignored: Transaction Not Found" };
                    }

                    // Bước 3: Kiểm tra Idempotency (Gạch nợ đúp)
                    if (tx.Status != null && tx.Status.Code == "PAID")
                    {
                        _logger.LogInformation($"[SePay] Giao dịch {refCode} đã được gạch nợ trước đó. Bỏ qua.");
                        return new SePayResponseDto { success = true, message = "Success: Already Paid" };
                    }

                    // Bước 4: Kiểm tra Underpayment (Chuyển khoản thiếu tiền)
                    if (payload.amountIn < tx.Amount)
                    {
                        var failedStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.BillingStatus>().FirstOrDefaultAsync(s => s.Code == "FAILED");
                        tx.StatusId = failedStatus?.Id;
                        tx.SePayTransactionId = payload.referenceNumber;
                        transactionRepo.Update(tx);
                        await _unitOfWork.CommitAsync();

                        _logger.LogWarning($"[SePay] UNDERPAYMENT ALERT: Khách chuyển thiếu tiền cho đơn {refCode}. Cần: {tx.Amount}, Nhận: {payload.amountIn}");
                        return new SePayResponseDto { success = true, message = "Handled: Underpayment" };
                    }

                    // Bước 5: Cập nhật Trạng thái Thành Công
                    var paidStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.BillingStatus>().FirstOrDefaultAsync(s => s.Code == "PAID");
                    tx.StatusId = paidStatus?.Id;
                    tx.SePayTransactionId = payload.referenceNumber;
                    transactionRepo.Update(tx);

                    // Trừ lượt khuyến mãi (Chống Promo Exhaustion)
                    if (tx.PromotionId.HasValue)
                    {
                        var promo = await _unitOfWork.Repository<Promotion>()
                            .FirstOrDefaultAsync(p => p.Id == tx.PromotionId.Value, ignoreQueryFilters: true);
                        if (promo != null)
                        {
                            promo.CurrentUses += 1;
                            _unitOfWork.Repository<Promotion>().Update(promo);
                        }
                    }

                    // Nâng cấp Gói cước cho Trung tâm
                    if (tx.OrganizationId.HasValue)
                    {
                        var org = await _unitOfWork.Repository<Organization>()
                            .FirstOrDefaultAsync(o => o.Id == tx.OrganizationId.Value, ignoreQueryFilters: true);
                        if (org != null)
                        {
                            org.SubscriptionStatus = "PAID";

                            var plan = await _unitOfWork.Repository<SubscriptionPlan>()
                                .FirstOrDefaultAsync(p => p.Id == tx.PlanId, ignoreQueryFilters: true);
                            if (plan != null)
                            {
                                org.CurrentPlanId = plan.Id;
                            }

                            var now = DateTime.UtcNow;
                            var currentEnd = org.SubscriptionEnd ?? now;
                            var startCalculatingFrom = currentEnd > now ? currentEnd : now;

                            org.SubscriptionStart = org.SubscriptionStart ?? now;
                            org.SubscriptionEnd = startCalculatingFrom.AddMonths(tx.MonthsToAdd);

                            _unitOfWork.Repository<Organization>().Update(org);

                            // Bước 6: Xóa Cache RAM để khách hàng dùng được phần mềm ngay lập tức (0.001s)
                            await _cache.RemoveAsync($"OrgSubscription_{org.Id}");

                            // Send notification to CENTER_ADMIN
                            var admins = await _unitOfWork.Repository<User>().FindAsync(u => u.OrganizationId == org.Id && u.Role != null && u.Role.Code == "CENTER_ADMIN", includeProperties: "Role");
                            foreach (var admin in admins)
                            {
                                await _notificationService.CreateAndSendAsync(
                                    admin.Id,
                                    "Thanh toán thành công",
                                    $"Thanh toán thành công! Gói cước {tx.PlanName} đã được kích hoạt. Số tiền: {payload.amountIn:N0} VND.",
                                    "BILLING"
                                );
                            }
                        }
                    }

                    await _unitOfWork.CommitAsync();

                    _logger.LogInformation($"[SePay] GẠCH NỢ THÀNH CÔNG cho đơn {refCode}. Số tiền: {payload.amountIn}");
                    return new SePayResponseDto { success = true, message = "Success: Payment processed and subscription activated" };
                }
                finally
                {
                    // LUÔN LUÔN NHẢ KHÓA DÙ THÀNH CÔNG HAY THẤT BẠI
                    await _cache.ReleaseLockAsync(lockKey);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SePay] Lỗi hệ thống khi xử lý Webhook");
                // Vẫn trả về success = true để SePay không gửi lại payload gây lặp vô tận (nếu lỗi là do code logic)
                return new SePayResponseDto { success = true, message = "Error: Internal exception caught" };
            }
        }
    }
}
