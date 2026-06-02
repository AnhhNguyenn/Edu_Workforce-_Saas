using System;
using System.Collections.Generic;

namespace EduOps.Application.DTOs.Auth.Responses
{
    public class RoleResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid? OrganizationId { get; set; }
        public bool IsSystemRole { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<PermissionResponseDto> Permissions { get; set; } = new List<PermissionResponseDto>();
    }
}
