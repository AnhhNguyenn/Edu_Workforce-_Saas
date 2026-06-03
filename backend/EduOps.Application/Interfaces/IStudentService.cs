using System;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic.Students.Requests;
using EduOps.Application.DTOs.Academic.Students.Responses;

namespace EduOps.Application.Interfaces
{
    public interface IStudentService
    {
        Task<PagedResult<StudentListResponseDto>> GetStudentsAsync(Guid organizationId, GetStudentListQueryDto query);
        Task<StudentDetailResponseDto> GetByIdAsync(Guid id, Guid organizationId);
        Task<StudentDetailResponseDto> CreateAsync(Guid organizationId, CreateStudentRequestDto request);
        Task UpdateAsync(Guid id, Guid organizationId, UpdateStudentRequestDto request);
        Task DeleteAsync(Guid id, Guid organizationId);
        Task<byte[]> ExportToExcelAsync(Guid organizationId);
        Task<StudentImportResultDto> ImportFromExcelAsync(Guid organizationId, Stream fileStream);
    }
}
