using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic;
using EduOps.Application.Services;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [Route("api/schools")]
    [ApiController]
    [Authorize(Roles = "CENTER_ADMIN")]
    public class SchoolsController : ControllerBase
    {
        private readonly ISchoolService _schoolService;

        public SchoolsController(ISchoolService schoolService)
        {
            _schoolService = schoolService;
        }

        private Guid GetOrganizationId()
        {
            var claim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(claim)) return Guid.Empty; // Fallback
            return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, [FromQuery] string? searchKeyword = null)
        {
            var result = await _schoolService.GetSchoolsAsync(GetOrganizationId(), pageNumber, pageSize, searchKeyword);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var orgId = GetOrganizationId();
            var result = await _schoolService.GetByIdAsync(id, orgId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SchoolRequestDto request)
        {
            var orgId = GetOrganizationId();
            var result = await _schoolService.CreateAsync(orgId, request);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] SchoolRequestDto request)
        {
            var orgId = GetOrganizationId();
            await _schoolService.UpdateAsync(id, orgId, request);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var orgId = GetOrganizationId();
            await _schoolService.DeleteAsync(id, orgId);
            return NoContent();
        }
    }
}
