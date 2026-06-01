using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic.Classes.Requests;
using EduOps.Application.DTOs.Academic.Classes.Responses;
using EduOps.Application.Services;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduOps.Api.Filters;

namespace EduOps.Api.Controllers
{
    [Route("api/classes")]
    [ApiController]
    [Authorize(Roles = "CENTER_ADMIN,TEACHER")]
    [RequirePaidSubscription]
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
        public async Task<IActionResult> Get([FromQuery] GetClassListQueryDto query)
        {
            Guid? teacherId = null;
            if (User.IsInRole("TEACHER"))
            {
                var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(userIdString, out var uid)) teacherId = uid;
            }

            var result = await _classService.GetClassesAsync(GetOrganizationId(), query, teacherId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            Guid? teacherId = null;
            if (User.IsInRole("TEACHER"))
            {
                var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(userIdString, out var uid)) teacherId = uid;
            }

            var result = await _classService.GetByIdAsync(id, GetOrganizationId(), teacherId);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "CENTER_ADMIN")]
        public async Task<IActionResult> Create([FromBody] CreateClassRequestDto request)
        {
            var result = await _classService.CreateAsync(GetOrganizationId(), request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        
        [HttpPut("{id}")]
        [Authorize(Roles = "CENTER_ADMIN")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateClassRequestDto request)
        {
            await _classService.UpdateAsync(id, GetOrganizationId(), request);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "CENTER_ADMIN")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _classService.DeleteAsync(id, GetOrganizationId());
            return NoContent();
        }
    }
}
