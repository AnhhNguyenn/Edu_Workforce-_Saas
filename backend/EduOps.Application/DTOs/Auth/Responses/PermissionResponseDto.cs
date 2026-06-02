using System;

namespace EduOps.Application.DTOs.Auth.Responses
{
    public class PermissionResponseDto
    {
        public Guid Id { get; set; }
        public string Module { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
