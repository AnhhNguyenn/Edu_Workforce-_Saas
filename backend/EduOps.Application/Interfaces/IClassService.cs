using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic;

namespace EduOps.Application.Interfaces
{
    public interface IClassService
    {
        Task<PagedResult<ClassDto>> GetClassesAsync(Guid organizationId, Guid? schoolId, int pageNumber, int pageSize, string? searchKeyword = null);
        Task<ClassDto> GetByIdAsync(Guid id, Guid organizationId);
        Task<ClassDto> CreateAsync(Guid organizationId, ClassRequestDto request);
        Task UpdateAsync(Guid id, Guid organizationId, ClassRequestDto request);
        Task DeleteAsync(Guid id, Guid organizationId);
    }
}
