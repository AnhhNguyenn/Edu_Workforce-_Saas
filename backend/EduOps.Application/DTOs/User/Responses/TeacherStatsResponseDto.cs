using System;
using System.Collections.Generic;
using EduOps.Domain.Enums;

namespace EduOps.Application.DTOs.User.Responses
{
    public class TeacherStatsResponseDto
    {
        public int TotalSessions { get; set; }
        public int CompletedSessions { get; set; }
        public int AttendanceRate { get; set; }
        public List<TeacherSessionStatDto> Sessions { get; set; } = new List<TeacherSessionStatDto>();
    }

    public class TeacherSessionStatDto
    {
        public Guid SessionId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string LessonTitle { get; set; } = string.Empty;
        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public SessionStatus SessionStatus { get; set; }
        
        public bool HasCheckedIn { get; set; }
        public DateTime? CheckinTime { get; set; }
        public int LateMinutes { get; set; }
        public int PenaltyPercentage { get; set; }
        
        // Cờ trạng thái: OK, LATE, MISSED, UPCOMING
        public string AttendanceStatus { get; set; } = "UPCOMING"; 
    }
}
