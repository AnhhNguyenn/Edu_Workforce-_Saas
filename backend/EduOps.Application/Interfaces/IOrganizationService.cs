using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Organization.Requests;
using EduOps.Application.DTOs.Organization.Responses;

namespace EduOps.Application.Interfaces
{
    public interface IOrganizationService
    {
        Task<PagedResult<OrganizationListResponseDto>> GetOrganizationsAsync(GetOrganizationListQueryDto query);
        Task<OrganizationDetailResponseDto> GetByIdAsync(Guid id);
        Task<OrganizationDetailResponseDto> CreateAsync(CreateOrganizationRequestDto request);
        Task UpdateAsync(Guid id, UpdateOrganizationRequestDto request);
        Task UpdateSubscriptionAsync(Guid id, UpdateOrganizationSubscriptionRequestDto request);
        Task SuspendAsync(Guid id);
        Task ActivateAsync(Guid id);
        Task DeleteAsync(Guid id);
    }
}
