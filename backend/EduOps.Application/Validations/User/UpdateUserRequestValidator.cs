using FluentValidation;
using EduOps.Application.DTOs.User;

namespace EduOps.Application.Validations.User
{
    public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequestDto>
    {
        public UpdateUserRequestValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Họ và tên không được để trống")
                .MaximumLength(100).WithMessage("Họ và tên không được vượt quá 100 ký tự");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được để trống")
                .EmailAddress().WithMessage("Email không đúng định dạng");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Phân quyền không được để trống")
                .Must(r => r == "SUPER_ADMIN" || r == "CENTER_ADMIN" || r == "TEACHER" || r == "ASSISTANT")
                .WithMessage("Phân quyền không hợp lệ");

            RuleFor(x => x.Phone)
                .MaximumLength(10).WithMessage("Số điện thoại không được vượt quá 10 ký tự");
        }
    }
}
