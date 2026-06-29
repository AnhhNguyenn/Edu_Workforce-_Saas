using EduOps.Application.DTOs.Academic.Sessions.Responses;
using EduOps.Domain.Entities;
using System.Linq;

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
                GroupId = s.GroupId,
                TeacherId = s.TeacherId,
                AssistantIds = s.SessionAssistants?.Where(sa => sa.DeletedAt == null).Select(sa => sa.AssistantId).ToList(),
                LessonTitle = s.LessonTitle,
                RoomName = s.RoomName,
                Notes = s.Notes,
                ActualStudentCount = s.ActualStudentCount,
                ExtraData = s.ExtraData,
                LocalTeachingAssistant = s.LocalTeachingAssistant,
                LessonProgress = s.LessonProgress,
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
                GroupId = s.GroupId,
                TeacherId = s.TeacherId,
                AssistantIds = s.SessionAssistants?.Where(sa => sa.DeletedAt == null).Select(sa => sa.AssistantId).ToList(),
                LessonTitle = s.LessonTitle,
                RoomName = s.RoomName,
                Notes = s.Notes,
                ActualStudentCount = s.ActualStudentCount,
                ExtraData = s.ExtraData,
                LocalTeachingAssistant = s.LocalTeachingAssistant,
                LessonProgress = s.LessonProgress,
                SessionDate = s.SessionDate,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                StatusId = s.StatusId,
                StatusCode = s.Status?.Code ?? string.Empty
            };
        }
    }
}
