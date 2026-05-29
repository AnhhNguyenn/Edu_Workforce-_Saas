using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic;

namespace EduOps.Application.Interfaces
{
    public interface ISchoolService
    {
        Task<PagedResult<SchoolDto>> GetSchoolsAsync(Guid organizationId, int pageNumber, int pageSize, string? searchKeyword = null);
        Task<SchoolDto> GetByIdAsync(Guid id, Guid organizationId);
        Task<SchoolDto> CreateAsync(Guid organizationId, SchoolRequestDto request);
        Task UpdateAsync(Guid id, Guid organizationId, SchoolRequestDto request);
        Task DeleteAsync(Guid id, Guid organizationId);
    }
}
