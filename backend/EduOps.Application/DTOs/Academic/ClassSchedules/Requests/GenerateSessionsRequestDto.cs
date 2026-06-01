using System;

namespace EduOps.Application.DTOs.Academic.ClassSchedules.Requests
{
    public class GenerateSessionsRequestDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
    }
}
