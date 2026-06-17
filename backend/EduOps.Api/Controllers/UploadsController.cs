using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduOps.Api.Authorization;

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
        [HasPermission("Files:Upload")]
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
                
                // Kiểm tra Magic Bytes (OWASP Standard) chống file thực thi giả dạng ảnh
                if (!IsValidImageFile(stream))
                {
                    return BadRequest(new { message = "File upload chứa mã độc hoặc không phải là hình ảnh thật sự." });
                }

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

        private bool IsValidImageFile(Stream stream)
        {
            var signatures = new List<byte[]>
            {
                new byte[] { 0xFF, 0xD8, 0xFF }, // JPEG
                new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }, // PNG
                new byte[] { 0x47, 0x49, 0x46, 0x38 } // GIF
            };

            var headerBytes = new byte[8];
            stream.Read(headerBytes, 0, 8);
            stream.Position = 0; // Reset position

            foreach (var signature in signatures)
            {
                if (headerBytes.Take(signature.Length).SequenceEqual(signature))
                {
                    return true;
                }
            }
            return false;
        }
    }
}
