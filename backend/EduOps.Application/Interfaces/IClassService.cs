using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic;

namespace EduOps.Application.Interfaces
{
    public interface IClassService
    {
        Task<IEnumerable<ClassDto>> GetClassesAsync(Guid organizationId, Guid? schoolId);
        Task<ClassDto> CreateAsync(Guid organizationId, ClassRequestDto request);
    }
}
