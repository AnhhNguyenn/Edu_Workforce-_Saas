using FluentValidation;
using EduOps.Application.DTOs.Academic;

namespace EduOps.Application.Validations.Academic
{
    public class ClassEnrollmentRequestValidator : AbstractValidator<ClassEnrollmentRequestDto>
    {
        public ClassEnrollmentRequestValidator()
        {
            RuleFor(x => x.StudentId)
                .NotEmpty().WithMessage("Bắt buộc phải chọn Học viên để ghi danh");
        }
    }
}
