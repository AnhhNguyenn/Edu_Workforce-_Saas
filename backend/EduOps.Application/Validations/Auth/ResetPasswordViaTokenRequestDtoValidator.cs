using FluentValidation;
using EduOps.Application.DTOs.Auth;

namespace EduOps.Application.Validations.Auth
{
    public class ResetPasswordViaTokenRequestDtoValidator : AbstractValidator<ResetPasswordViaTokenRequestDto>
    {
        public ResetPasswordViaTokenRequestDtoValidator()
        {
            RuleFor(x => x.Token)
                .NotEmpty().WithMessage("Mã xác nhận không được để trống.")
                .Length(6).WithMessage("Mã xác nhận phải bao gồm đúng 6 ký tự.");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Mật khẩu mới không được để trống.")
                .MinimumLength(6).WithMessage("Mật khẩu mới phải có ít nhất 6 ký tự.")
                .MaximumLength(50).WithMessage("Mật khẩu mới không được vượt quá 50 ký tự.");
        }
    }
}
