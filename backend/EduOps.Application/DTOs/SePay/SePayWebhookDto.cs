namespace EduOps.Application.DTOs.SePay
{
    public class SePayWebhookDto
    {
        public int id { get; set; }
        public string gateway { get; set; } = string.Empty;
        public string transactionDate { get; set; } = string.Empty;
        public string accountNumber { get; set; } = string.Empty;
        public string? subAccount { get; set; }
        public decimal amountIn { get; set; }
        public decimal amountOut { get; set; }
        public decimal accumulated { get; set; }
        public string? code { get; set; }
        public string transactionContent { get; set; } = string.Empty;
        public string referenceNumber { get; set; } = string.Empty;
        public string? body { get; set; }
    }
}
