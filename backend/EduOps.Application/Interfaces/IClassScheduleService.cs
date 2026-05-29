using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic;

namespace EduOps.Application.Interfaces
{
    public interface IClassScheduleService
    {
        Task AddScheduleAsync(Guid classId, Guid organizationId, ClassScheduleRequestDto request);
        Task EnrollStudentAsync(Guid classId, Guid organizationId, ClassEnrollmentRequestDto request);
        Task GenerateSessionsAsync(Guid classId, Guid organizationId, DateTime fromDate, DateTime toDate);
    }
}
