using FluentValidation;
using EduOps.Application.DTOs.User;

namespace EduOps.Application.Validations.User
{
    public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequestDto>
    {
        public ChangePasswordRequestValidator()
        {
            RuleFor(x => x.OldPassword)
                .NotEmpty().WithMessage("Mật khẩu cũ không được để trống.");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Mật khẩu mới không được để trống.")
                .MinimumLength(6).WithMessage("Mật khẩu mới phải có ít nhất 6 ký tự.")
                .MaximumLength(50).WithMessage("Mật khẩu mới không được vượt quá 50 ký tự.");
        }
    }
}
