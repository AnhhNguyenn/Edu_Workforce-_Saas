using FluentValidation;
using EduOps.Application.DTOs.Auth;

namespace EduOps.Application.Validations.Auth
{
    public class ForgotPasswordRequestDtoValidator : AbstractValidator<ForgotPasswordRequestDto>
    {
        public ForgotPasswordRequestDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được để trống.")
                .EmailAddress().WithMessage("Email không đúng định dạng.")
                .MaximumLength(100).WithMessage("Email không được vượt quá 100 ký tự.");
        }
    }
}
