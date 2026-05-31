using EduOps.Application.DTOs.Subscription;
using FluentValidation;

namespace EduOps.Application.Validations.Subscription
{
    public class SubscribeRequestValidator : AbstractValidator<SubscribeRequestDto>
    {
        public SubscribeRequestValidator()
        {
            RuleFor(x => x.PlanId).NotEmpty();
            RuleFor(x => x.BillingCycle).Must(c => c == "MONTHLY" || c == "YEARLY").WithMessage("Must be MONTHLY or YEARLY.");
            RuleFor(x => x.PromoCode).MaximumLength(20).When(x => !string.IsNullOrEmpty(x.PromoCode));
        }
    }
}
