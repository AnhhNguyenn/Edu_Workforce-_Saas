using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClosedXML.Excel;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic.Students.Requests;
using EduOps.Application.DTOs.Academic.Students.Responses;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class StudentService : IStudentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly INotificationService _notificationService;
        private readonly IRealtimeNotificationService _realtimeNotification;

        public StudentService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, INotificationService notificationService, IRealtimeNotificationService realtimeNotification)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _notificationService = notificationService;
            _realtimeNotification = realtimeNotification;
        }

        public async Task<PagedResult<StudentListResponseDto>> GetStudentsAsync(Guid organizationId, GetStudentListQueryDto query)
        {
            var repo = _unitOfWork.Repository<Student>();

            System.Linq.Expressions.Expression<Func<Student, bool>> predicate = s =>
                s.OrganizationId == organizationId &&
                (string.IsNullOrEmpty(query.SearchKeyword) || s.FullName.ToLower().Contains(query.SearchKeyword.ToLower()) || s.StudentCode.ToLower().Contains(query.SearchKeyword.ToLower()) || (s.StudentDetail != null && s.StudentDetail.ParentPhone != null && s.StudentDetail.ParentPhone.ToLower().Contains(query.SearchKeyword.ToLower()))) &&
                (!query.ClassId.HasValue || s.Enrollments.Any(e => e.ClassId == query.ClassId.Value && e.Status != null && e.Status.Code == "ACTIVE")) &&
                (!query.SchoolId.HasValue || s.Enrollments.Any(e => e.Class != null && e.Class.SchoolId == query.SchoolId.Value && e.Status != null && e.Status.Code == "ACTIVE")) &&
                (string.IsNullOrEmpty(query.StatusCode) || (s.Status != null && s.Status.Code == query.StatusCode));

            var result = await repo.FindPagedAsync(predicate, query.PageNumber, query.PageSize, includeProperties: "Status,StudentDetail,Enrollments,Enrollments.Status,Enrollments.Class,Enrollments.Class.School");

            return new PagedResult<StudentListResponseDto>
            {
                Items = result.Items.Select(s => s.ToListResponseDto()),
                TotalCount = result.TotalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };
        }

        public async Task<StudentDetailResponseDto> GetByIdAsync(Guid id, Guid organizationId)
        {
            var student = await _unitOfWork.Repository<Student>().FirstOrDefaultAsync(s => s.Id == id, includeProperties: "Status,StudentDetail,Enrollments,Enrollments.Status,Enrollments.Class,Enrollments.Class.School");
            if (student == null || student.OrganizationId != organizationId)
                throw new NotFoundException("Student", id);

            return student.ToDetailResponseDto();
        }

        public async Task<StudentDetailResponseDto> CreateAsync(Guid organizationId, CreateStudentRequestDto request)
        {
            var repo = _unitOfWork.Repository<Student>();

            request.StudentCode = request.StudentCode.Trim();
            request.FullName = request.FullName.Trim();
            if (request.ParentName != null) request.ParentName = request.ParentName.Trim();
            if (request.ParentPhone != null) request.ParentPhone = request.ParentPhone.Trim();
            if (request.ParentEmail != null) request.ParentEmail = request.ParentEmail.Trim();

            var existing = await repo.AnyAsync(s => s.OrganizationId == organizationId && s.StudentCode == request.StudentCode, ignoreQueryFilters: true);
            if (existing)
                throw new BadRequestException("Mã học viên đã tồn tại trong hệ thống (bao gồm cả học viên đã nghỉ học).");

            var activeStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "ACTIVE");
            var student = new Student
            {
                OrganizationId = organizationId,
                FullName = request.FullName,
                StudentCode = request.StudentCode,
                StudentDetail = new EduOps.Domain.Entities.StudentDetail
                {
                    BirthDate = request.BirthDate?.ToUniversalTime(),
                    ParentName = request.ParentName ?? "",
                    ParentPhone = request.ParentPhone ?? "",
                    ParentEmail = request.ParentEmail ?? ""
                },
                StatusId = activeStatus?.Id
            };

            await repo.AddAsync(student);

            if (request.ClassId.HasValue)
            {
                var classRepo = _unitOfWork.Repository<Class>();
                var classEntity = await classRepo.FirstOrDefaultAsync(c => c.Id == request.ClassId.Value && c.OrganizationId == organizationId);
                if (classEntity != null)
                {
                    var enrolledStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.EnrollmentStatus>().FirstOrDefaultAsync(s => s.Code == "ENROLLED");
                    var enrollment = new ClassEnrollment
                    {
                        OrganizationId = organizationId,
                        ClassId = classEntity.Id,
                        StudentId = student.Id,
                        EnrollmentDate = DateTime.UtcNow,
                        StatusId = enrolledStatus?.Id
                    };
                    await _unitOfWork.Repository<ClassEnrollment>().AddAsync(enrollment);
                }
            }

            await _unitOfWork.CommitAsync();

            if (_currentUserService.UserId != Guid.Empty)
            {
                await _notificationService.CreateAndSendAsync(
                    _currentUserService.UserId,
                    "Hệ thống",
                    $"Bạn đã tạo thành công học viên mới: {student.FullName}",
                    "SYSTEM"
                );
            }

            await _realtimeNotification.SendToOrganizationAsync(organizationId, "StudentUpdated");

            return student.ToDetailResponseDto();
        }

        public async Task UpdateAsync(Guid id, Guid organizationId, UpdateStudentRequestDto request)
        {
            var repo = _unitOfWork.Repository<Student>();
            var student = await repo.FirstOrDefaultAsync(s => s.Id == id, includeProperties: "StudentDetail,Status");
            if (student == null || student.OrganizationId != organizationId)
                throw new NotFoundException("Student", id);

            request.FullName = request.FullName.Trim();
            if (request.ParentName != null) request.ParentName = request.ParentName.Trim();
            if (request.ParentPhone != null) request.ParentPhone = request.ParentPhone.Trim();
            if (request.ParentEmail != null) request.ParentEmail = request.ParentEmail.Trim();
            student.FullName = request.FullName;
            // StudentCode is immutable, omitted from update
            if (student.StudentDetail == null) student.StudentDetail = new EduOps.Domain.Entities.StudentDetail();
            student.StudentDetail.BirthDate = request.BirthDate?.ToUniversalTime();
            student.StudentDetail.ParentName = request.ParentName ?? "";
            student.StudentDetail.ParentPhone = request.ParentPhone ?? "";
            student.StudentDetail.ParentEmail = request.ParentEmail ?? "";

            if (!string.IsNullOrEmpty(request.StatusCode))
            {
                var newStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == request.StatusCode);
                if (newStatus != null)
                {
                    student.StatusId = newStatus.Id;
                }
            }

            repo.Update(student);

            // Handle Class Enrollment Update
            var enrollmentRepo = _unitOfWork.Repository<ClassEnrollment>();
            var activeStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.EnrollmentStatus>().FirstOrDefaultAsync(s => s.Code == "ENROLLED");
            var inactiveStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.EnrollmentStatus>().FirstOrDefaultAsync(s => s.Code == "DROPPED_OUT");

            var activeStatusId = activeStatus?.Id;
            var currentEnrollments = await enrollmentRepo.FindAsync(e => e.StudentId == student.Id && e.OrganizationId == organizationId && e.StatusId == activeStatusId);
            var currentEnrollment = currentEnrollments.FirstOrDefault();

            if (request.ClassId.HasValue)
            {
                if (currentEnrollment == null)
                {
                    // Create new enrollment
                    var classRepo = _unitOfWork.Repository<Class>();
                    var classEntity = await classRepo.FirstOrDefaultAsync(c => c.Id == request.ClassId.Value && c.OrganizationId == organizationId);
                    if (classEntity != null)
                    {
                        var newEnrollment = new ClassEnrollment
                        {
                            OrganizationId = organizationId,
                            ClassId = classEntity.Id,
                            StudentId = student.Id,
                            EnrollmentDate = DateTime.UtcNow,
                            StatusId = activeStatus?.Id
                        };
                        await enrollmentRepo.AddAsync(newEnrollment);
                    }
                }
                else if (currentEnrollment.ClassId != request.ClassId.Value)
                {
                    // Update existing enrollment to new class
                    var classRepo = _unitOfWork.Repository<Class>();
                    var classEntity = await classRepo.FirstOrDefaultAsync(c => c.Id == request.ClassId.Value && c.OrganizationId == organizationId);
                    if (classEntity != null)
                    {
                        currentEnrollment.StatusId = inactiveStatus?.Id; // Deactivate old
                        enrollmentRepo.Update(currentEnrollment);

                        var newEnrollment = new ClassEnrollment
                        {
                            OrganizationId = organizationId,
                            ClassId = classEntity.Id,
                            StudentId = student.Id,
                            EnrollmentDate = DateTime.UtcNow,
                            StatusId = activeStatus?.Id
                        };
                        await enrollmentRepo.AddAsync(newEnrollment);
                    }
                }
            }
            else
            {
                // Remove/Deactivate active enrollment if ClassId is null (meaning removed from class)
                if (currentEnrollment != null)
                {
                    currentEnrollment.StatusId = inactiveStatus?.Id;
                    enrollmentRepo.Update(currentEnrollment);
                }
            }

            await _unitOfWork.CommitAsync();

            if (_currentUserService.UserId != Guid.Empty)
            {
                await _notificationService.CreateAndSendAsync(
                    _currentUserService.UserId,
                    "Hệ thống",
                    $"Bạn đã cập nhật thành công học viên: {student.FullName}",
                    "SYSTEM"
                );
            }

            await _realtimeNotification.SendToOrganizationAsync(organizationId, "StudentUpdated");
        }

        public async Task DeleteAsync(Guid id, Guid organizationId)
        {
            var repo = _unitOfWork.Repository<Student>();
            var student = await repo.GetByIdAsync(id);
            if (student == null || student.OrganizationId != organizationId)
                throw new NotFoundException("Student", id);

            student.DeletedAt = DateTime.UtcNow;
            var inactiveStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "INACTIVE");
            student.StatusId = inactiveStatus?.Id;
            repo.Update(student);
            await _unitOfWork.CommitAsync();
            await _realtimeNotification.SendToOrganizationAsync(organizationId, "StudentUpdated");
        }

        public async Task<byte[]> ExportToExcelAsync(Guid organizationId)
        {
            var students = await _unitOfWork.Repository<Student>().FindAsync(s => s.OrganizationId == organizationId, asNoTracking: true, includeProperties: "StudentDetail,Status");

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Students");

            worksheet.Cell(1, 1).Value = "Mã học viên";
            worksheet.Cell(1, 2).Value = "Họ và tên";
            worksheet.Cell(1, 3).Value = "Ngày sinh";
            worksheet.Cell(1, 4).Value = "Tên phụ huynh";
            worksheet.Cell(1, 5).Value = "SĐT phụ huynh";
            worksheet.Cell(1, 6).Value = "Email phụ huynh";
            worksheet.Cell(1, 7).Value = "Trạng thái";

            // Style headers
            var headerRange = worksheet.Range("A1:G1");
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

            int row = 2;
            foreach (var student in students)
            {
                worksheet.Cell(row, 1).Value = student.StudentCode;
                worksheet.Cell(row, 2).Value = student.FullName;
                worksheet.Cell(row, 3).Value = student.StudentDetail?.BirthDate?.ToString("dd/MM/yyyy") ?? "";
                worksheet.Cell(row, 4).Value = student.StudentDetail?.ParentName ?? "";
                worksheet.Cell(row, 5).Value = student.StudentDetail?.ParentPhone ?? "";
                worksheet.Cell(row, 6).Value = student.StudentDetail?.ParentEmail ?? "";
                worksheet.Cell(row, 7).Value = student.Status?.Name ?? "";
                row++;
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        public async Task<StudentImportResultDto> ImportFromExcelAsync(Guid organizationId, Stream fileStream)
        {
            var result = new StudentImportResultDto();
            using var workbook = new XLWorkbook(fileStream);
            var worksheet = workbook.Worksheets.FirstOrDefault();

            if (worksheet == null)
            {
                result.Errors.Add("File Excel không có sheet nào.");
                return result;
            }

            var repo = _unitOfWork.Repository<Student>();
            var activeStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "ACTIVE");

            // Row 1 is header
            int totalRows = worksheet.LastRowUsed()?.RowNumber() ?? 0;
            var studentsToAdd = new List<Student>();

            for (int row = 2; row <= totalRows; row++)
            {
                try
                {
                    var studentCode = worksheet.Cell(row, 1).GetString().Trim();
                    var fullName = worksheet.Cell(row, 2).GetString().Trim();

                    if (string.IsNullOrEmpty(studentCode) || string.IsNullOrEmpty(fullName))
                    {
                        result.FailureCount++;
                        result.Errors.Add($"Dòng {row}: Mã học viên và Họ tên là bắt buộc.");
                        continue;
                    }

                    var exists = await repo.AnyAsync(s => s.OrganizationId == organizationId && s.StudentCode == studentCode, ignoreQueryFilters: true);
                    if (exists || studentsToAdd.Any(s => s.StudentCode == studentCode))
                    {
                        result.FailureCount++;
                        result.Errors.Add($"Dòng {row}: Mã học viên '{studentCode}' đã tồn tại.");
                        continue;
                    }

                    var birthDateStr = worksheet.Cell(row, 3).GetString().Trim();
                    DateTime? birthDate = null;
                    if (DateTime.TryParseExact(birthDateStr, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out var parsedDate))
                    {
                        birthDate = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);
                    }

                    var student = new Student
                    {
                        OrganizationId = organizationId,
                        StudentCode = studentCode,
                        FullName = fullName,
                        StatusId = activeStatus?.Id,
                        StudentDetail = new EduOps.Domain.Entities.StudentDetail
                        {
                            BirthDate = birthDate,
                            ParentName = worksheet.Cell(row, 4).GetString().Trim(),
                            ParentPhone = worksheet.Cell(row, 5).GetString().Trim(),
                            ParentEmail = worksheet.Cell(row, 6).GetString().Trim()
                        }
                    };

                    studentsToAdd.Add(student);
                    result.SuccessCount++;
                }
                catch (Exception ex)
                {
                    result.FailureCount++;
                    result.Errors.Add($"Dòng {row}: Lỗi xử lý dữ liệu - {ex.Message}");
                }
            }

            if (studentsToAdd.Any())
            {
                await repo.AddRangeAsync(studentsToAdd);
                await _unitOfWork.CommitAsync();

                if (_currentUserService.UserId != Guid.Empty)
                {
                    await _notificationService.CreateAndSendAsync(
                        _currentUserService.UserId,
                        "Hệ thống",
                        $"Import dữ liệu học viên hoàn tất. Thành công: {result.SuccessCount}, Thất bại: {result.FailureCount}.",
                        "SYSTEM"
                    );
                }

                await _realtimeNotification.SendToOrganizationAsync(organizationId, "StudentUpdated");
            }

            return result;
        }

        public async Task BulkAssignClassAsync(Guid organizationId, BulkAssignClassRequestDto request)
        {
            if (request.StudentIds == null || !request.StudentIds.Any())
                throw new BadRequestException("Vui lòng chọn ít nhất một học viên.");

            var classRepo = _unitOfWork.Repository<Class>();
            var classEntity = await classRepo.FirstOrDefaultAsync(c => c.Id == request.ClassId && c.OrganizationId == organizationId);
            if (classEntity == null)
                throw new NotFoundException("Class", request.ClassId);

            var enrollmentRepo = _unitOfWork.Repository<ClassEnrollment>();
            var activeStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.EnrollmentStatus>().FirstOrDefaultAsync(s => s.Code == "ENROLLED");
            var inactiveStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.EnrollmentStatus>().FirstOrDefaultAsync(s => s.Code == "DROPPED_OUT");
            var activeStatusId = activeStatus?.Id;

            foreach (var studentId in request.StudentIds)
            {
                var student = await _unitOfWork.Repository<Student>().FirstOrDefaultAsync(s => s.Id == studentId && s.OrganizationId == organizationId);
                if (student == null) continue;

                var currentEnrollments = await enrollmentRepo.FindAsync(e => e.StudentId == student.Id && e.OrganizationId == organizationId && e.StatusId == activeStatusId);
                var currentEnrollment = currentEnrollments.FirstOrDefault();

                if (currentEnrollment == null)
                {
                    // Create new enrollment
                    var newEnrollment = new ClassEnrollment
                    {
                        OrganizationId = organizationId,
                        ClassId = classEntity.Id,
                        StudentId = student.Id,
                        EnrollmentDate = DateTime.UtcNow,
                        StatusId = activeStatus?.Id
                    };
                    await enrollmentRepo.AddAsync(newEnrollment);
                }
                else if (currentEnrollment.ClassId != request.ClassId)
                {
                    // Deactivate old enrollment and create new one
                    currentEnrollment.StatusId = inactiveStatus?.Id;
                    enrollmentRepo.Update(currentEnrollment);

                    var newEnrollment = new ClassEnrollment
                    {
                        OrganizationId = organizationId,
                        ClassId = classEntity.Id,
                        StudentId = student.Id,
                        EnrollmentDate = DateTime.UtcNow,
                        StatusId = activeStatus?.Id
                    };
                    await enrollmentRepo.AddAsync(newEnrollment);
                }
            }

            await _unitOfWork.CommitAsync();

            if (_currentUserService.UserId != Guid.Empty)
            {
                await _notificationService.CreateAndSendAsync(
                    _currentUserService.UserId,
                    "Hệ thống",
                    $"Đã xếp {request.StudentIds.Count} học viên vào lớp {classEntity.Name}.",
                    "SYSTEM"
                );
            }

            await _realtimeNotification.SendToOrganizationAsync(organizationId, "StudentUpdated");
        }
    }
}
