using FluentValidation;
using EduOps.Application.DTOs.Academic;

namespace EduOps.Application.Validations.Academic
{
    public class StudentRequestValidator : AbstractValidator<StudentRequestDto>
    {
        public StudentRequestValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Tên học viên không được để trống")
                .MaximumLength(100).WithMessage("Tên học viên không được vượt quá 100 ký tự");

            RuleFor(x => x.StudentCode)
                .NotEmpty().WithMessage("Mã học viên không được để trống")
                .MaximumLength(50).WithMessage("Mã học viên không được vượt quá 50 ký tự");

            RuleFor(x => x.ParentName)
                .MaximumLength(100).WithMessage("Tên phụ huynh không được vượt quá 100 ký tự");

            RuleFor(x => x.ParentPhone)
                .MaximumLength(15).WithMessage("Số điện thoại không được vượt quá 15 ký tự");

            RuleFor(x => x.ParentEmail)
                .EmailAddress().When(x => !string.IsNullOrEmpty(x.ParentEmail)).WithMessage("Email phụ huynh không hợp lệ");
        }
    }
}
