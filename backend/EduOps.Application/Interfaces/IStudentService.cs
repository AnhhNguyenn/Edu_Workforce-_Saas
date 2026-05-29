using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic;

namespace EduOps.Application.Interfaces
{
    public interface IStudentService
    {
        Task<PagedResult<StudentDto>> GetStudentsAsync(Guid organizationId, int pageNumber, int pageSize, string? searchKeyword = null);
        Task<StudentDto> GetByIdAsync(Guid id, Guid organizationId);
        Task<StudentDto> CreateAsync(Guid organizationId, StudentRequestDto request);
        Task UpdateAsync(Guid id, Guid organizationId, StudentRequestDto request);
        Task DeleteAsync(Guid id, Guid organizationId);
    }
}
