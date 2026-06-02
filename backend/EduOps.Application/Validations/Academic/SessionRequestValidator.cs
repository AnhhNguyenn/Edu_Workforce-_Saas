using FluentValidation;
using EduOps.Application.DTOs.Academic;
using System;

namespace EduOps.Application.Validations.Academic
{
    public class SessionRequestValidator : AbstractValidator<SessionRequestDto>
    {
        public SessionRequestValidator()
        {
            RuleFor(x => x.SchoolId)
                .NotEmpty().WithMessage("Bắt buộc phải chọn Cơ sở (School)");

            RuleFor(x => x.TeacherId)
                .NotEmpty().WithMessage("Bắt buộc phải chọn Giáo viên phụ trách");

            RuleFor(x => x.LessonTitle)
                .NotEmpty().WithMessage("Tiêu đề bài học không được để trống")
                .MaximumLength(255).WithMessage("Tiêu đề không được vượt quá 255 ký tự");

            RuleFor(x => x.StartTime)
                .LessThan(x => x.EndTime).WithMessage("Giờ bắt đầu phải nhỏ hơn Giờ kết thúc");
        }
    }
}
