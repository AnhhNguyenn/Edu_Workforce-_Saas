using System;

namespace EduOps.Application.DTOs.Billing
{
    public class SePayWebhookDto
    {
        public int id { get; set; }
        public string gateway { get; set; } = string.Empty;
        public string transactionDate { get; set; } = string.Empty;
        public string accountNumber { get; set; } = string.Empty;
        public string subAccount { get; set; } = string.Empty;
        public decimal transferAmount { get; set; }
        public string transferType { get; set; } = string.Empty; // "in" or "out"
        public string content { get; set; } = string.Empty; // Nội dung chuyển khoản chứa Mã Đơn
        public string referenceCode { get; set; } = string.Empty;
        public decimal accumulated { get; set; }
    }
}
