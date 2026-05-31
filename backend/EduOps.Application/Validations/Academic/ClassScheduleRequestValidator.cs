using FluentValidation;
using EduOps.Application.DTOs.Academic;
using System;

namespace EduOps.Application.Validations.Academic
{
    public class ClassScheduleRequestValidator : AbstractValidator<ClassScheduleRequestDto>
    {
        public ClassScheduleRequestValidator()
        {
            RuleFor(x => x.DayOfWeek)
                .InclusiveBetween(1, 7).WithMessage("Ngày trong tuần phải từ 1 (Thứ 2) đến 7 (Chủ nhật)");
                
            RuleFor(x => x.TeacherId)
                .NotEmpty().WithMessage("Bắt buộc phải chọn Giáo viên phụ trách");

            RuleFor(x => x.StartTime)
                .LessThan(x => x.EndTime).WithMessage("Giờ bắt đầu phải nhỏ hơn Giờ kết thúc");
        }
    }
}
