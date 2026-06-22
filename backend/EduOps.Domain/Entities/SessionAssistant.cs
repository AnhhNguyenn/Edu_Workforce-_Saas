using System;

namespace EduOps.Domain.Entities
{
    public class SessionAssistant : TenantEntity
    {
        public Guid SessionId { get; set; }
        public Guid AssistantId { get; set; }

        public virtual Session? Session { get; set; }
        public virtual User? Assistant { get; set; }
    }
}
