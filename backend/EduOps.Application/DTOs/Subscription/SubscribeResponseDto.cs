namespace EduOps.Application.DTOs.Subscription
{
    public class SubscribeResponseDto
    {
        public string ReferenceCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public string BankAccount { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string QrCodeUrl { get; set; } = string.Empty;
        public int RemainingSeconds { get; set; }
    }
}