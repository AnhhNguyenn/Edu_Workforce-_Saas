using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic;
using EduOps.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [Route("api/classes")]
    [ApiController]
    [Authorize]
    public class ClassesController : ControllerBase
    {
        private readonly IClassService _classService;

        public ClassesController(IClassService classService)
        {
            _classService = classService;
        }

        private Guid GetOrganizationId() => Guid.Empty; // MOCK

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] Guid? schoolId)
        {
            var result = await _classService.GetClassesAsync(GetOrganizationId(), schoolId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ClassRequestDto request)
        {
            var result = await _classService.CreateAsync(GetOrganizationId(), request);
            return Ok(result);
        }
    }
}
