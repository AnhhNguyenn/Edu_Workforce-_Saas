using System;
using System.Collections.Generic;

namespace EduOps.Application.DTOs.Auth.Requests
{
    public class UpdateRoleRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<Guid> PermissionIds { get; set; } = new List<Guid>();
    }
}
