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
                TeacherId = s.TeacherId,
                AssistantId = s.AssistantId,
                LessonTitle = s.LessonTitle,
                RoomName = s.RoomName,
                SessionDate = s.SessionDate,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                StatusId = s.StatusId,
                StatusCode = s.Status?.Code ?? string.Empty
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
                RoomName = s.RoomName,
                SessionDate = s.SessionDate,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                StatusId = s.StatusId,
                StatusCode = s.Status?.Code ?? string.Empty
            };
        }
    }
}
