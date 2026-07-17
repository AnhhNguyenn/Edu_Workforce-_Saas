using System;

namespace EduOps.Domain.Entities
{
    public class SessionTeacher : TenantEntity
    {
        public Guid SessionId { get; set; }
        public Guid TeacherId { get; set; }

        public virtual Session? Session { get; set; }
        public virtual User? Teacher { get; set; }
    }
}
