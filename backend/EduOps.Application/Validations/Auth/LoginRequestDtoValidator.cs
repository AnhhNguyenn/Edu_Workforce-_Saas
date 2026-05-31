using FluentValidation;
using EduOps.Application.DTOs.Auth;

namespace EduOps.Application.Validations.Auth
{
    public class LoginRequestDtoValidator : AbstractValidator<LoginRequestDto>
    {
        public LoginRequestDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được để trống.")
                .EmailAddress().WithMessage("Email không đúng định dạng.")
                .MaximumLength(100).WithMessage("Email không được vượt quá 100 ký tự.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Mật khẩu không được để trống.")
                .MaximumLength(50).WithMessage("Mật khẩu không được vượt quá 50 ký tự.");
        }
    }
}
