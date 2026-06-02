using FluentValidation;
using EduOps.Application.DTOs.Academic;

namespace EduOps.Application.Validations.Academic
{
    public class ClassRequestValidator : AbstractValidator<ClassRequestDto>
    {
        public ClassRequestValidator()
        {
            RuleFor(x => x.SchoolId)
                .NotEmpty().WithMessage("Bắt buộc phải chọn cơ sở (School)");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên lớp không được để trống")
                .MaximumLength(100).WithMessage("Tên lớp không được vượt quá 100 ký tự");

            RuleFor(x => x.Grade)
                .MaximumLength(50).WithMessage("Khối lớp không được vượt quá 50 ký tự");

            RuleFor(x => x.Subject)
                .MaximumLength(100).WithMessage("Môn học không được vượt quá 100 ký tự");
        }
    }
}
