using FluentValidation;
using EduOps.Application.DTOs.Academic;

namespace EduOps.Application.Validations.Academic
{
    public class SchoolRequestValidator : AbstractValidator<SchoolRequestDto>
    {
        public SchoolRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên cơ sở không được để trống")
                .MaximumLength(200).WithMessage("Tên cơ sở không được vượt quá 200 ký tự");

            RuleFor(x => x.Address)
                .MaximumLength(500).WithMessage("Địa chỉ không được vượt quá 500 ký tự");

            RuleFor(x => x.AttendanceRadius)
                .GreaterThan(0).WithMessage("Bán kính điểm danh phải lớn hơn 0 mét");

            RuleFor(x => x.LateThresholdMinutes)
                .GreaterThanOrEqualTo(0).WithMessage("Thời gian đi trễ không được là số âm");

            RuleFor(x => x.EarlyCheckoutMinutes)
                .GreaterThanOrEqualTo(0).WithMessage("Thời gian về sớm không được là số âm");
        }
    }
}
