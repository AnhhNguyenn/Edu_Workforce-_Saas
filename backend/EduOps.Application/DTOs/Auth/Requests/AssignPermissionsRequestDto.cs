using System;
using System.Collections.Generic;

namespace EduOps.Application.DTOs.Auth.Requests
{
    public class AssignPermissionsRequestDto
    {
        public List<Guid> PermissionIds { get; set; } = new();
    }
}
