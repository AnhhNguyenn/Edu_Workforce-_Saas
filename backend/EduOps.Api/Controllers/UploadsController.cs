using System;
using System.Threading.Tasks;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Controllers
{
    [Route("api/uploads")]
    [ApiController]
    public class UploadsController : ControllerBase
    {
        private readonly IStorageService _storageService;
        private readonly ICustomLogger _logger;

        public UploadsController(IStorageService storageService, ICustomLogger logger)
        {
            _storageService = storageService;
            _logger = logger;
        }

        [HttpPost("image")]
        [Authorize(Roles = "SUPER_ADMIN,CENTER_ADMIN")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File không hợp lệ hoặc bị trống." });

            // Kiểm tra định dạng ảnh cơ bản
            if (!file.ContentType.StartsWith("image/"))
                return BadRequest(new { message = "Vui lòng chọn một file hình ảnh." });

            // Giới hạn dung lượng 5MB
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "Dung lượng ảnh tối đa là 5MB." });

            try
            {
                using var stream = file.OpenReadStream();
                // Sinh tên file duy nhất để tránh trùng lặp trên R2
                var fileName = $"uploads/{Guid.NewGuid()}_{file.FileName}";
                
                var url = await _storageService.UploadFileAsync(stream, fileName, file.ContentType);
                
                return Ok(new { url = url });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi upload ảnh lên R2: " + ex.Message);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi upload ảnh lên server." });
            }
        }
    }
}
