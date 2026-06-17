using EduOps.Application.DTOs.Subscription;
using FluentValidation;

namespace EduOps.Application.Validations.Subscription
{
    public class SubscribeRequestValidator : AbstractValidator<SubscribeRequestDto>
    {
        public SubscribeRequestValidator()
        {
            RuleFor(x => x.PlanId).NotEmpty();
            RuleFor(x => x.BillingCycle).Must(c => c == "MONTHLY" || c == "YEARLY").WithMessage("Chu kỳ thanh toán không hợp lệ.");
            RuleFor(x => x.PromoCode).MaximumLength(50).WithMessage("Mã giảm giá tối đa 50 ký tự.").When(x => !string.IsNullOrEmpty(x.PromoCode));
        }
    }
}
