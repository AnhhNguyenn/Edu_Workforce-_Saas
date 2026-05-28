using System;

namespace EduOps.Domain.Entities
{
    public class UserDevice : BaseEntity
    {
        public Guid UserId { get; set; }
        public string DeviceToken { get; set; } = string.Empty;
        public string? Platform { get; set; }
        public DateTime? LastActiveAt { get; set; }
    }
}
