using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.SystemBroadcast;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [Route("api/superadmin/broadcasts")]
    [ApiController]
    [Authorize(Roles = "SUPER_ADMIN")]
    public class SystemBroadcastsController : ControllerBase
    {
        private readonly ISystemBroadcastService _systemBroadcastService;

        public SystemBroadcastsController(ISystemBroadcastService systemBroadcastService)
        {
            _systemBroadcastService = systemBroadcastService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _systemBroadcastService.GetPagedAsync(pageNumber, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _systemBroadcastService.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSystemBroadcastDto dto)
        {
            var result = await _systemBroadcastService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSystemBroadcastDto dto)
        {
            var result = await _systemBroadcastService.UpdateAsync(id, dto);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _systemBroadcastService.DeleteAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/send")]
        public async Task<IActionResult> Send(Guid id)
        {
            await _systemBroadcastService.SendAsync(id);
            return Ok(new { message = "Broadcast sent successfully." });
        }

        [HttpPost("{id}/recall")]
        public async Task<IActionResult> Recall(Guid id)
        {
            await _systemBroadcastService.RecallAsync(id);
            return Ok(new { message = "Broadcast recalled successfully." });
        }
    }
}
