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
                .EmailAddress().WithMessage("A valid email is required.")
                .MaximumLength(255).WithMessage("Email cannot exceed 255 characters.");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Phone is required.")
                .MaximumLength(20).WithMessage("Phone cannot exceed 20 characters.")
                .Matches(@"^\+?[0-9\s-]+$").WithMessage("Phone must contain only numbers and optional '+', '-', or spaces.");

            RuleFor(x => x.Address)
                .MaximumLength(500).WithMessage("Address cannot exceed 500 characters.");


        }
    }
}
