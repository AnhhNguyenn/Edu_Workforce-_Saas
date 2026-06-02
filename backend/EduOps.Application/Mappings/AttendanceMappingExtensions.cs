using EduOps.Application.DTOs.Attendance;
using EduOps.Domain.Entities;

namespace EduOps.Application.Mappings
{
    public static class AttendanceMappingExtensions
    {
        public static AttendanceDto ToDto(this Attendance a)
        {
            if (a == null) return null!;

            return new AttendanceDto
            {
                Id = a.Id,
                SessionId = a.SessionId,
                UserId = a.UserId,
                CheckinTime = a.CheckinTime,
                CheckoutTime = a.CheckoutTime,
                StatusId = a.StatusId,
                StatusCode = a.Status?.Code ?? string.Empty,
                LateMinutes = a.LateMinutes,
                EarlyCheckoutMinutes = a.EarlyCheckoutMinutes,
                Note = a.Note
            };
        }
    }
}
