using FluentValidation;
using EduOps.Application.DTOs.SystemSettings.Requests;

namespace EduOps.Application.Validations
{
    public class SystemSettingUpdateRequestValidator : AbstractValidator<SystemSettingUpdateRequestDto>
    {
        public SystemSettingUpdateRequestValidator()
        {
            RuleFor(x => x.SettingValue)
                .NotEmpty().WithMessage("Giá trị cài đặt không được để trống.");
        }
    }
}
