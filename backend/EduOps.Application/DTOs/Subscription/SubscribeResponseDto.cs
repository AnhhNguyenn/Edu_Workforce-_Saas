namespace EduOps.Application.DTOs.Subscription
{
    public class SubscribeResponseDto
    {
        public string ReferenceCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public string BankAccount { get; set; } = "123456789"; // Dummy data, will come from config later
        public string BankName { get; set; } = "MBBank";
    }
}
