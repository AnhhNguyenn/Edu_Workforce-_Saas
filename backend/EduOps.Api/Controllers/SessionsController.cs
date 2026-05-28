using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic;
using EduOps.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [Route("api/sessions")]
    [ApiController]
    [Authorize]
    public class SessionsController : ControllerBase
    {
        private readonly ISessionService _sessionService;

        public SessionsController(ISessionService sessionService)
        {
            _sessionService = sessionService;
        }

        private Guid GetOrganizationId() => Guid.Empty; // MOCK

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SessionRequestDto request)
        {
            var result = await _sessionService.CreateSessionAsync(GetOrganizationId(), request);
            return Ok(result);
        }
    }
}
