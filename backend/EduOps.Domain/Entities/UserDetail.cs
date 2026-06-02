using System;

namespace EduOps.Domain.Entities
{
    public class UserDetail : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual User? User { get; set; }

        public string? AvatarUrl { get; set; }

        public Guid? GenderId { get; set; }
        public virtual Gender? Gender { get; set; }

        public DateTime? BirthDate { get; set; }
        public string? Address { get; set; }
    }
}
