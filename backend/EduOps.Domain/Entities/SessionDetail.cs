using System;

namespace EduOps.Domain.Entities
{
    public class SessionDetail : BaseEntity
    {
        public Guid SessionId { get; set; }
        public virtual Session? Session { get; set; }

        public string? LessonContent { get; set; }
        public string? Note { get; set; }
    }
}
