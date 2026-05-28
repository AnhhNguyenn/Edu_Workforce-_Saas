using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic;

namespace EduOps.Application.Interfaces
{
    public interface ISchoolService
    {
        Task<IEnumerable<SchoolDto>> GetSchoolsAsync(Guid organizationId);
        Task<SchoolDto> CreateAsync(Guid organizationId, SchoolRequestDto request);
        Task UpdateAsync(Guid id, Guid organizationId, SchoolRequestDto request);
    }
}
