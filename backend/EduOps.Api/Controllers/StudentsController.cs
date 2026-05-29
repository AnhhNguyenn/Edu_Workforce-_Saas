using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic;
using EduOps.Application.Interfaces;
using EduOps.Api.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [Route("api/students")]
    [ApiController]
    [Authorize]
    [RequirePaidSubscription]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentsController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        private Guid GetOrganizationId()
        {
            var claim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(claim)) return Guid.Empty;
            return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, [FromQuery] string? searchKeyword = null)
        {
            var result = await _studentService.GetStudentsAsync(GetOrganizationId(), pageNumber, pageSize, searchKeyword);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _studentService.GetByIdAsync(id, GetOrganizationId());
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "CENTER_ADMIN,ASSISTANT")]
        public async Task<IActionResult> Create([FromBody] StudentRequestDto request)
        {
            var result = await _studentService.CreateAsync(GetOrganizationId(), request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "CENTER_ADMIN,ASSISTANT")]
        public async Task<IActionResult> Update(Guid id, [FromBody] StudentRequestDto request)
        {
            await _studentService.UpdateAsync(id, GetOrganizationId(), request);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "CENTER_ADMIN,ASSISTANT")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _studentService.DeleteAsync(id, GetOrganizationId());
            return NoContent();
        }
    }
}
