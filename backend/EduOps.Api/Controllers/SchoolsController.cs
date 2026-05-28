using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic;
using EduOps.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [Route("api/schools")]
    [ApiController]
    [Authorize]
    public class SchoolsController : ControllerBase
    {
        private readonly ISchoolService _schoolService;

        public SchoolsController(ISchoolService schoolService)
        {
            _schoolService = schoolService;
        }

        private Guid GetOrganizationId()
        {
            // TODO: Lấy từ Claims của JWT Token
            return Guid.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> GetSchools()
        {
            var orgId = GetOrganizationId();
            var result = await _schoolService.GetSchoolsAsync(orgId);
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
    }
}
