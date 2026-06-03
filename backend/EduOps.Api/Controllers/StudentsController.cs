using System;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Academic.Students.Requests;
using EduOps.Application.DTOs.Academic.Students.Responses;
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
        [RequirePermission("Students", "View")]
        public async Task<IActionResult> Get([FromQuery] GetStudentListQueryDto query)
        {
            var result = await _studentService.GetStudentsAsync(GetOrganizationId(), query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [RequirePermission("Students", "View")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _studentService.GetByIdAsync(id, GetOrganizationId());
            return Ok(result);
        }

        [HttpPost]
        [RequirePermission("Students", "Create")]
        public async Task<IActionResult> Create([FromBody] CreateStudentRequestDto request)
        {
            var result = await _studentService.CreateAsync(GetOrganizationId(), request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [RequirePermission("Students", "Update")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStudentRequestDto request)
        {
            await _studentService.UpdateAsync(id, GetOrganizationId(), request);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [RequirePermission("Students", "Delete")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _studentService.DeleteAsync(id, GetOrganizationId());
            return NoContent();
        }

        [HttpGet("export")]
        [RequirePermission("Students", "Export")]
        public async Task<IActionResult> ExportToExcel()
        {
            var fileBytes = await _studentService.ExportToExcelAsync(GetOrganizationId());
            var fileName = $"Students_Export_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        [HttpPost("import")]
        [RequirePermission("Students", "Import")]
        public async Task<IActionResult> ImportFromExcel(Microsoft.AspNetCore.Http.IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Không có file được chọn.");

            if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Chỉ hỗ trợ file .xlsx");

            using var stream = file.OpenReadStream();
            var result = await _studentService.ImportFromExcelAsync(GetOrganizationId(), stream);
            return Ok(result);
        }
    }
}
