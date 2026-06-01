using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic.ClassSchedules.Requests;

namespace EduOps.Application.Interfaces
{
    public interface IClassScheduleService
    {
        Task AddScheduleAsync(Guid classId, Guid organizationId, AddClassScheduleRequestDto request);
        Task EnrollStudentAsync(Guid classId, Guid organizationId, EnrollStudentRequestDto request);
        Task GenerateSessionsAsync(Guid classId, Guid organizationId, GenerateSessionsRequestDto request);
    }
}
