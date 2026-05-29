using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using EduOps.Application.Interfaces;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;
using EduOps.Application.Exceptions;
using EduOps.Application.DTOs.Billing;

namespace EduOps.Infrastructure.Services
{
    public class SePayService : ISePayService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ISubscriptionService _subscriptionService;
        private readonly IConfiguration _config;
        private readonly ILogger<SePayService> _logger;

        public SePayService(
            IUnitOfWork unitOfWork, 
            ISubscriptionService subscriptionService,
            IConfiguration config, 
            ILogger<SePayService> logger)
        {
            _unitOfWork = unitOfWork;
            _subscriptionService = subscriptionService;
            _config = config;
            _logger = logger;
        }

        public async Task<object> CreateCheckoutSessionAsync(Guid organizationId, Guid planId, string billingCycle, string? promoCode)
        {
            // 1. Tính toán giá tiền (Tái sử dụng logic của SubscriptionService nhưng chưa lưu PAID)
            // Lẽ ra hàm này nên được tách riêng trong SubscriptionService để tái sử dụng
            // Tạm thời hardcode tạo transaction PENDING.
            var plan = await _unitOfWork.Repository<SubscriptionPlan>().GetByIdAsync(planId);
            if (plan == null) throw new NotFoundException("SubscriptionPlan", planId);

            decimal finalPrice = billingCycle == "YEARLY" ? plan.PricePerYear : plan.PricePerMonth;
            
            // Generate Invoice ID
            string invoiceId = $"INV{DateTime.UtcNow:yyyyMMddHHmmss}{new Random().Next(100,999)}";

            // Lưu Transaction PENDING
            var transaction = new BillingTransaction
            {
                OrganizationId = organizationId,
                Amount = finalPrice,
                PlanName = plan.Name,
                PaymentDate = DateTime.UtcNow,
                PaymentMethod = "SEPAY_BANK_TRANSFER",
                Status = BillingStatus.PENDING,
                ReferenceCode = invoiceId
            };
            
            await _unitOfWork.Repository<BillingTransaction>().AddAsync(transaction);
            await _unitOfWork.CommitAsync();

            // 2. Tạo Data Form cho Frontend gọi SePay Checkout
            var merchantId = _config["SePay:MerchantId"];
            
            // Vì không dùng SDK, ta trả về Form Fields chuẩn để Frontend tự tạo form POST lên SePay
            var formFields = new Dictionary<string, string>
            {
                { "payment_method", "BANK_TRANSFER" },
                { "order_invoice_number", invoiceId },
                { "order_amount", finalPrice.ToString("0") },
                { "currency", "VND" },
                { "order_description", $"Thanh toan goi {plan.Name}" },
                { "success_url", $"https://frontend.com/payment/success?invoice={invoiceId}" },
                { "error_url", $"https://frontend.com/payment/error?invoice={invoiceId}" },
                { "cancel_url", $"https://frontend.com/payment/cancel?invoice={invoiceId}" }
            };

            return new 
            {
                CheckoutUrl = "https://checkout.sepay.vn/pay", // URL mẫu của SePay
                MerchantId = merchantId,
                Fields = formFields
            };
        }

        public async Task HandleWebhookAsync(SePayWebhookDto webhookPayload)
        {
            _logger.LogInformation($"Received SePay Webhook. Transaction: {webhookPayload.content}");
            
            // 1. Chỉ xử lý tiền vào (transferType == "in")
            if (webhookPayload.transferType != "in") return;

            // 2. Tìm Invoice ID (ReferenceCode) trong nội dung chuyển khoản
            // Nội dung thường là: "Thanh toan INV20260529143000123" -> Ta tìm chuỗi bắt đầu bằng INV
            string[] words = webhookPayload.content.Split(new[] { ' ', '-', '_' }, StringSplitOptions.RemoveEmptyEntries);
            string? invoiceId = null;
            foreach (var word in words)
            {
                if (word.StartsWith("INV"))
                {
                    invoiceId = word;
                    break;
                }
            }

            if (string.IsNullOrEmpty(invoiceId))
            {
                _logger.LogWarning("Không tìm thấy Mã Đơn Hàng (INV...) trong nội dung chuyển khoản.");
                return;
            }

            // 3. Tra cứu Transaction
            var transaction = (await _unitOfWork.Repository<BillingTransaction>().FindAsync(t => t.ReferenceCode == invoiceId)).FirstOrDefault();
            if (transaction != null && transaction.Status == BillingStatus.PENDING)
            {
                // Kiểm tra số tiền chuyển có đủ không (Tùy chọn, SePay có thể chuyển dư)
                if (webhookPayload.transferAmount >= transaction.Amount)
                {
                    transaction.Status = BillingStatus.PAID;
                    transaction.SePayTransactionId = webhookPayload.referenceCode; // Lưu mã GD của SePay
                    _unitOfWork.Repository<BillingTransaction>().Update(transaction);

                    // 4. Mở khóa Organization
                    if (transaction.OrganizationId.HasValue)
                    {
                        var org = await _unitOfWork.Repository<Organization>().GetByIdAsync(transaction.OrganizationId.Value);
                        if (org != null)
                        {
                            org.SubscriptionStatus = "ACTIVE"; // MỞ KHÓA PAYWALL
                            _unitOfWork.Repository<Organization>().Update(org);
                            _logger.LogInformation($"Đã kích hoạt Gói cước cho Organization {org.Code}");
                        }
                    }

                    await _unitOfWork.CommitAsync();
                }
                else
                {
                    _logger.LogWarning($"Khách chuyển thiếu tiền. Yêu cầu: {transaction.Amount}, Thực tế: {webhookPayload.transferAmount}");
                }
            }
        }
    }
}
