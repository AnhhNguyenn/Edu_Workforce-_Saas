using FluentValidation;
using EduOps.Application.DTOs.Auth;

namespace EduOps.Application.Validations.Auth
{
    public class RefreshTokenRequestDtoValidator : AbstractValidator<RefreshTokenRequestDto>
    {
        public RefreshTokenRequestDtoValidator()
        {
            RuleFor(x => x.AccessToken)
                .NotEmpty().WithMessage("AccessToken không được để trống.");

            RuleFor(x => x.RefreshToken)
                .NotEmpty().WithMessage("RefreshToken không được để trống.")
                .MaximumLength(500).WithMessage("RefreshToken không hợp lệ.");
        }
    }
}
