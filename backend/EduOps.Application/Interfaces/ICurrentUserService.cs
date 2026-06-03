using System;

namespace EduOps.Application.Interfaces
{
    public interface ICurrentUserService
    {
        Guid UserId { get; }
        Guid? OrganizationId { get; }
        string Role { get; }
        bool IsBackgroundJob { get; }
        string? IpAddress { get; }
        string? UserAgent { get; }
    }
}
