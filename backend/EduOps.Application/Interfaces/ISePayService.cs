using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Billing;

namespace EduOps.Application.Interfaces
{
    public interface ISePayService
    {
        // Tạo thông tin thanh toán (URL hoặc Data Form) để Frontend render
        Task<object> CreateCheckoutSessionAsync(Guid organizationId, Guid planId, string billingCycle, string? promoCode);
        
        // Xử lý IPN Webhook từ SePay bắn về
        Task HandleWebhookAsync(SePayWebhookDto webhookPayload);
    }
}
