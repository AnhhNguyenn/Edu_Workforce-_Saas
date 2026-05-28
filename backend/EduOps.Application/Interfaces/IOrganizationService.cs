using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Organization;

namespace EduOps.Application.Interfaces
{
    public interface IOrganizationService
    {
        Task<IEnumerable<OrganizationDto>> GetAllAsync();
        Task<OrganizationDto> GetByIdAsync(Guid id);
        Task<OrganizationDto> CreateAsync(OrganizationRequestDto request);
        Task UpdateAsync(Guid id, OrganizationRequestDto request);
        Task SuspendAsync(Guid id);
        Task ActivateAsync(Guid id);
    }
}
