using System;
using System.Collections.Generic;

namespace EduOps.Application.DTOs.Attendance
{
    public class StudentAttendanceSubmitDto
    {
        public List<StudentAttendanceRecordDto> Records { get; set; } = new List<StudentAttendanceRecordDto>();
    }

    public class StudentAttendanceRecordDto
    {
        public Guid StudentId { get; set; }
        public bool IsPresent { get; set; }
        public string? Note { get; set; }
    }
}
