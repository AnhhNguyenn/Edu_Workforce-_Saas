using FluentValidation;
using EduOps.Application.DTOs.Auth.Requests;

namespace EduOps.Application.Validations.Auth
{
    public class CreateRoleRequestValidator : AbstractValidator<CreateRoleRequestDto>
    {
        public CreateRoleRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên Role không được để trống.")
                .MaximumLength(50).WithMessage("Tên Role không được vượt quá 50 ký tự.");
        }
    }
}
