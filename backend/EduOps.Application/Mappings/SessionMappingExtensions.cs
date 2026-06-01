using EduOps.Application.DTOs.Academic.Sessions.Responses;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class SessionMappingExtensions
    {
        public static SessionListResponseDto ToListResponseDto(this Session s)
        {
            if (s == null) return null!;

            return new SessionListResponseDto
            {
                Id = s.Id,
                ClassId = s.ClassId,
                LessonTitle = s.LessonTitle,
                SessionDate = s.SessionDate,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Status = s.Status.ToString()
            };
        }

        public static SessionDetailResponseDto ToDetailResponseDto(this Session s)
        {
            if (s == null) return null!;

            return new SessionDetailResponseDto
            {
                Id = s.Id,
                ClassId = s.ClassId,
                TeacherId = s.TeacherId,
                AssistantId = s.AssistantId,
                LessonTitle = s.LessonTitle,
                SessionDate = s.SessionDate,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Status = s.Status.ToString()
            };
        }
    }
}
