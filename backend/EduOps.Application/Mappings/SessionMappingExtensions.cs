using EduOps.Application.DTOs.Academic;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class SessionMappingExtensions
    {
        public static SessionDto ToDto(this Session s)
        {
            if (s == null) return null!;

            return new SessionDto
            {
                Id = s.Id,
                ClassId = s.ClassId,
                TeacherId = s.TeacherId,
                AssistantId = s.AssistantId,
                LessonTitle = s.LessonTitle,
                SessionDate = s.SessionDate,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Status = s.Status
            };
        }
    }
}
