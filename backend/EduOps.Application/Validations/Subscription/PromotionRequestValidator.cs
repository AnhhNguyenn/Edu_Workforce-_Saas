using EduOps.Application.DTOs.Subscription;
using FluentValidation;

namespace EduOps.Application.Validations.Subscription
{
    public class PromotionRequestValidator : AbstractValidator<PromotionRequestDto>
    {
        public PromotionRequestValidator()
        {
            RuleFor(x => x.Code)
                .MaximumLength(20)
                .Matches("^[A-Z0-9_]+$").WithMessage("Code must be uppercase and contain only letters, numbers, and underscores.")
                .When(x => !string.IsNullOrEmpty(x.Code));

            RuleFor(x => x.Type).Must(t => t == "PROMO_CODE" || t == "AUTO_DISCOUNT").WithMessage("Invalid promotion type.");
            RuleFor(x => x.DiscountPercentage).GreaterThan(0).LessThanOrEqualTo(100);
            RuleFor(x => x.EndDate).GreaterThan(x => x.StartDate).WithMessage("End date must be after start date.");
            RuleFor(x => x.MaxUses).GreaterThan(0).When(x => x.MaxUses.HasValue);
        }
    }
}
