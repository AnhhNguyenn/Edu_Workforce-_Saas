using System;

namespace EduOps.Application.Interfaces
{
    public interface ICurrentUserService
    {
        Guid UserId { get; }
        Guid? OrganizationId { get; }
        string Role { get; }
    }
}
