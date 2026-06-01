using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic.Schools.Requests;
using EduOps.Application.DTOs.Academic.Schools.Responses;

namespace EduOps.Application.Interfaces
{
    public interface ISchoolService
    {
        Task<PagedResult<SchoolListResponseDto>> GetSchoolsAsync(Guid organizationId, GetSchoolListQueryDto query);
        Task<SchoolDetailResponseDto> GetByIdAsync(Guid id, Guid organizationId);
        Task<SchoolDetailResponseDto> CreateAsync(Guid organizationId, CreateSchoolRequestDto request);
        Task UpdateAsync(Guid id, Guid organizationId, UpdateSchoolRequestDto request);
        Task DeleteAsync(Guid id, Guid organizationId);
    }
}
