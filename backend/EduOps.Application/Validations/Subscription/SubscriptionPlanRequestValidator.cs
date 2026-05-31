using EduOps.Application.DTOs.Subscription;
using FluentValidation;

namespace EduOps.Application.Validations.Subscription
{
    public class SubscriptionPlanRequestValidator : AbstractValidator<SubscriptionPlanRequestDto>
    {
        public SubscriptionPlanRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Description).MaximumLength(500);
            RuleFor(x => x.MaxUsers).GreaterThan(0);
            RuleFor(x => x.PricePerMonth).GreaterThanOrEqualTo(0);
            RuleFor(x => x.PricePerYear).GreaterThanOrEqualTo(0);
        }
    }
}
