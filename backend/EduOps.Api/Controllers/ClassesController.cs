using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic;
using EduOps.Application.Services;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [Route("api/classes")]
    [ApiController]
    [Authorize(Roles = "CENTER_ADMIN,TEACHER")]
    public class ClassesController : ControllerBase
    {
        private readonly IClassService _classService;

        public ClassesController(IClassService classService)
        {
            _classService = classService;
        }

        private Guid GetOrganizationId()
        {
            var claim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(claim)) return Guid.Empty; // Fallback
            return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] Guid? schoolId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _classService.GetClassesAsync(GetOrganizationId(), schoolId, pageNumber, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _classService.GetByIdAsync(id, GetOrganizationId());
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "CENTER_ADMIN")]
        public async Task<IActionResult> Create([FromBody] ClassRequestDto request)
        {
            var result = await _classService.CreateAsync(GetOrganizationId(), request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "CENTER_ADMIN")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ClassRequestDto request)
        {
            await _classService.UpdateAsync(id, GetOrganizationId(), request);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _classService.DeleteAsync(id, GetOrganizationId());
            return NoContent();
        }
    }
}
