using EduOps.Application.DTOs.Organization;
using FluentValidation;

namespace EduOps.Application.Validations.Organization
{
    public class OrganizationRequestValidator : AbstractValidator<OrganizationRequestDto>
    {
        public OrganizationRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Organization Name is required.")
                .MaximumLength(200).WithMessage("Name cannot exceed 200 characters.");

            RuleFor(x => x.Code)
                .NotEmpty().WithMessage("Organization Code is required.")
                .Matches("^[A-Z0-9_]+$").WithMessage("Code must be uppercase and contain only letters, numbers, and underscores.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("A valid email is required.");

            RuleFor(x => x.MaxUsers)
                .GreaterThan(0).WithMessage("Max users must be greater than 0.");
        }
    }
}
