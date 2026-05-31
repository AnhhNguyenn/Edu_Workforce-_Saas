using System.Threading.Tasks;
using EduOps.Application.DTOs.SePay;

namespace EduOps.Application.Interfaces
{
    public interface ISePayService
    {
        Task<SePayResponseDto> ProcessWebhookAsync(SePayWebhookDto payload);
    }
}
