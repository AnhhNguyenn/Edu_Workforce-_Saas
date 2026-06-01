using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic.Classes.Requests;
using EduOps.Application.DTOs.Academic.Classes.Responses;

namespace EduOps.Application.Interfaces
{
    public interface IClassService
    {
        Task<PagedResult<ClassListResponseDto>> GetClassesAsync(Guid organizationId, GetClassListQueryDto query, Guid? teacherId);
        Task<ClassDetailResponseDto> GetByIdAsync(Guid id, Guid organizationId, Guid? teacherId = null);
        Task<ClassDetailResponseDto> CreateAsync(Guid organizationId, CreateClassRequestDto request);
        Task UpdateAsync(Guid id, Guid organizationId, UpdateClassRequestDto request);
        Task DeleteAsync(Guid id, Guid organizationId);
    }
}
