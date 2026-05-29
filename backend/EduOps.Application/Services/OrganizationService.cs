using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Organization;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class OrganizationService : IOrganizationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICustomLogger _logger;

        public OrganizationService(IUnitOfWork unitOfWork, ICustomLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<PagedResult<OrganizationDto>> GetOrganizationsAsync(int pageNumber, int pageSize)
        {
            try
            {
                var repo = _unitOfWork.Repository<Organization>();
                var result = await repo.FindPagedAsync(o => true, pageNumber, pageSize);
                
                return new PagedResult<OrganizationDto>
                {
                    Items = result.Items.Select(o => o.ToDto()),
                    TotalCount = result.TotalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching organizations");
                throw;
            }
        }

        public async Task<OrganizationDto> GetByIdAsync(Guid id)
        {
            var org = await _unitOfWork.Repository<Organization>().GetByIdAsync(id);
            if (org == null)
            {
                _logger.LogWarning($"Organization with ID {id} not found.");
                throw new NotFoundException("Organization", id);
            }

            return org.ToDto();
        }

        public async Task<OrganizationDto> CreateAsync(OrganizationRequestDto request)
        {
            try
            {
                var repo = _unitOfWork.Repository<Organization>();

                // Kiểm tra trùng mã code
                var existings = await repo.FindAsync(x => x.Code == request.Code);
                if (existings.Any())
                {
                    throw new BadRequestException($"Organization code '{request.Code}' already exists.");
                }

                var org = new Organization
                {
                    Name = request.Name,
                    Code = request.Code,
                    Email = request.Email,
                    Phone = request.Phone,
                    Address = request.Address,
                    MaxUsers = request.MaxUsers,
                    CurrentUsers = 0,
                    Status = AccountStatus.ACTIVE,
                    SubscriptionStart = DateTime.UtcNow,
                    SubscriptionEnd = DateTime.UtcNow.AddYears(1)
                };

                await repo.AddAsync(org);
                await _unitOfWork.CommitAsync();

                _logger.LogInformation($"Created new Organization: {org.Code}");

                return await GetByIdAsync(org.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating organization.");
                throw;
            }
        }

        public async Task UpdateAsync(Guid id, OrganizationRequestDto request)
        {
            var repo = _unitOfWork.Repository<Organization>();
            var org = await repo.GetByIdAsync(id);
            
            if (org == null) throw new NotFoundException("Organization", id);

            org.Name = request.Name;
            org.Email = request.Email;
            org.Phone = request.Phone;
            org.Address = request.Address;
            org.MaxUsers = request.MaxUsers;

            repo.Update(org);
            await _unitOfWork.CommitAsync();
            _logger.LogInformation($"Updated Organization: {org.Code}");
        }

        public async Task SuspendAsync(Guid id)
        {
            var repo = _unitOfWork.Repository<Organization>();
            var org = await repo.GetByIdAsync(id);
            if (org == null) throw new NotFoundException("Organization", id);

            org.Status = AccountStatus.SUSPENDED;
            repo.Update(org);
            await _unitOfWork.CommitAsync();
            _logger.LogWarning($"Suspended Organization: {org.Code}");
        }

        public async Task ActivateAsync(Guid id)
        {
            var repo = _unitOfWork.Repository<Organization>();
            var org = await repo.GetByIdAsync(id);
            if (org == null) throw new NotFoundException("Organization", id);

            org.Status = AccountStatus.ACTIVE;
            repo.Update(org);
            await _unitOfWork.CommitAsync();
            _logger.LogInformation($"Activated Organization: {org.Code}");
        }
    }
}
