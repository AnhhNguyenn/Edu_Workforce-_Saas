using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Organization;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [Route("api/organizations")]
    [ApiController]
    [Authorize(Roles = "SUPER_ADMIN")] // Chỉ Super Admin mới được cấu hình hệ thống đa Tenant
    public class OrganizationsController : ControllerBase
    {
        private readonly IOrganizationService _orgService;

        public OrganizationsController(IOrganizationService orgService)
        {
            _orgService = orgService;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrganizations([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _orgService.GetOrganizationsAsync(pageNumber, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _orgService.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrganizationRequestDto request)
        {
            var result = await _orgService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] OrganizationRequestDto request)
        {
            await _orgService.UpdateAsync(id, request);
            return NoContent();
        }

        [HttpPost("{id}/suspend")]
        public async Task<IActionResult> Suspend(Guid id)
        {
            await _orgService.SuspendAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/activate")]
        public async Task<IActionResult> Activate(Guid id)
        {
            await _orgService.ActivateAsync(id);
            return NoContent();
        }
    }
}
