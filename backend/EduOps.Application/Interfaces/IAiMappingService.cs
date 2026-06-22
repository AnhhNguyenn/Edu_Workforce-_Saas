using System.Collections.Generic;
using System.Threading.Tasks;

namespace EduOps.Application.Interfaces
{
    public interface IAiMappingService
    {
        Task<Dictionary<string, string>> MapExcelHeadersAsync(List<string> headers);
    }
}
