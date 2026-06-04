using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic.Sessions.Requests;
using EduOps.Application.DTOs.Academic.Sessions.Responses;
using EduOps.Application.Services;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduOps.Api.Filters;

namespace EduOps.Api.Controllers
{
    [Route("api/sessions")]
    [ApiController]
    [Authorize]
    [RequirePaidSubscription]
    public class SessionsController : ControllerBase
    {
        private readonly ISessionService _sessionService;

        public SessionsController(ISessionService sessionService)
        {
            _sessionService = sessionService;
        }

        private Guid GetOrganizationId()
        {
            var claim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(claim)) return Guid.Empty;
            return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetSessionListQueryDto query)
        {
            if (User.IsInRole("TEACHER"))
            {
                var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(userIdString, out var uid)) query.TeacherId = uid;
            }
            else if (User.IsInRole("ASSISTANT"))
            {
                var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(userIdString, out var uid)) query.AssistantId = uid;
            }

            var result = await _sessionService.GetSessionsAsync(GetOrganizationId(), query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _sessionService.GetSessionByIdAsync(id, GetOrganizationId());
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSessionRequestDto request)
        {
            var result = await _sessionService.CreateSessionAsync(GetOrganizationId(), request);
            return Ok(result);
        }
    }
}
