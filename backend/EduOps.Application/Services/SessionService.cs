using System;
using System.Text;
using System.Globalization;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Academic;
using EduOps.Application.DTOs.Academic.Sessions.Requests;
using EduOps.Application.DTOs.Academic.Sessions.Responses;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using System.IO;
using ClosedXML.Excel;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class SessionService : ISessionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICustomLogger _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly INotificationService _notificationService;
        private readonly IAiMappingService _aiMappingService;
        private readonly IRealtimeNotificationService _realtimeNotification;

        public SessionService(IUnitOfWork unitOfWork, ICustomLogger logger, ICurrentUserService currentUserService, INotificationService notificationService, IAiMappingService aiMappingService, IRealtimeNotificationService realtimeNotification)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _currentUserService = currentUserService;
            _notificationService = notificationService;
            _aiMappingService = aiMappingService;
            _realtimeNotification = realtimeNotification;
        }

        public async Task<PagedResult<SessionListResponseDto>> GetSessionsAsync(Guid organizationId, GetSessionListQueryDto query)
        {
            var repo = _unitOfWork.Repository<Session>();

            var result = await repo.FindPagedAsync(s =>
                s.OrganizationId == organizationId &&
                (!query.ClassId.HasValue || s.ClassId == query.ClassId.Value) &&
                (!query.SchoolId.HasValue || s.SchoolId == query.SchoolId.Value) &&
                (!query.TeacherId.HasValue || s.TeacherId == query.TeacherId.Value) &&
                (!query.AssistantId.HasValue || s.AssistantId == query.AssistantId.Value) &&
                (!query.StartDate.HasValue || s.SessionDate >= query.StartDate.Value.Date.ToUniversalTime()) &&
                (!query.EndDate.HasValue || s.SessionDate <= query.EndDate.Value.Date.ToUniversalTime()) &&
                (string.IsNullOrEmpty(query.SearchKeyword) || s.LessonTitle.ToLower().Contains(query.SearchKeyword.ToLower())),
                query.PageNumber, query.PageSize, includeProperties: "Status");

            return new PagedResult<SessionListResponseDto>
            {
                Items = result.Items.Select(s => s.ToListResponseDto()),
                TotalCount = result.TotalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };
        }

        public async Task<SessionDetailResponseDto> GetSessionByIdAsync(Guid id, Guid organizationId)
        {
            var repo = _unitOfWork.Repository<Session>();
            var session = await repo.FirstOrDefaultAsync(s => s.Id == id && s.OrganizationId == organizationId, includeProperties: "Status,Class,Teacher,Assistant");
            if (session == null)
            {
                throw new EduOps.Application.Exceptions.NotFoundException("Session", id);
            }
            return session.ToDetailResponseDto();
        }

        public async Task CheckConflictAsync(Guid organizationId, Guid? teacherId, List<Guid>? assistantIds, DateTime sessionDate, TimeSpan startTime, TimeSpan endTime, Guid? excludeSessionId = null)
        {
            var repo = _unitOfWork.Repository<Session>();
            var targetDate = sessionDate.Date.ToUniversalTime();

            // Tối ưu Performance: Tìm các session trùng lặp của Giáo viên hoặc Trợ giảng trong cùng ngày
            var exists = await repo.AnyAsync(s =>
                s.OrganizationId == organizationId &&
                (!excludeSessionId.HasValue || s.Id != excludeSessionId.Value) &&
                s.SessionDate == targetDate &&
                s.Status != null && s.Status.Code != "CANCELLED" &&
                ((teacherId.HasValue && s.TeacherId == teacherId.Value) || 
                 (assistantIds != null && assistantIds.Any() && s.SessionAssistants.Any(sa => assistantIds.Contains(sa.AssistantId))) ||
                 (assistantIds != null && assistantIds.Any() && s.AssistantId.HasValue && assistantIds.Contains(s.AssistantId.Value))) &&
                ((startTime >= s.StartTime && startTime < s.EndTime) ||
                 (endTime > s.StartTime && endTime <= s.EndTime) ||
                 (startTime <= s.StartTime && endTime >= s.EndTime))
            );

            if (exists)
            {
                _logger.LogWarning($"Conflict detected for Session: Teacher {teacherId} at {startTime}");
                throw new BadRequestException("Conflict detected: Teacher or Assistant is already assigned to another session at this time.");
            }
        }

        public async Task<SessionDetailResponseDto> CreateSessionAsync(Guid organizationId, CreateSessionRequestDto request)
        {
            try
            {
                // Validate Foreign Keys để chống lỗi 500
                var classEntity = await _unitOfWork.Repository<Class>().FirstOrDefaultAsync(c => c.Id == request.ClassId && c.OrganizationId == organizationId);
                if (classEntity == null)
                    throw new BadRequestException("Lớp học không tồn tại hoặc đã bị xóa.");
                    
                var schoolId = request.SchoolId != Guid.Empty ? request.SchoolId : classEntity.SchoolId;

                if (!await _unitOfWork.Repository<School>().AnyAsync(s => s.Id == schoolId && s.OrganizationId == organizationId))
                    throw new BadRequestException("Cơ sở không tồn tại hoặc đã bị xóa.");

                var userRepo = _unitOfWork.Repository<User>();
                if (request.TeacherId.HasValue)
                {
                    var teacher = await userRepo.FirstOrDefaultAsync(u => u.Id == request.TeacherId.Value, includeProperties: "Role");
                    if (teacher == null || teacher.OrganizationId != organizationId || teacher.Role?.Code != "TEACHER")
                        throw new BadRequestException("Giáo viên không hợp lệ hoặc không tồn tại.");
                }

                if (request.AssistantIds != null && request.AssistantIds.Any())
                {
                    foreach (var aId in request.AssistantIds)
                    {
                        var assistant = await userRepo.FirstOrDefaultAsync(u => u.Id == aId, includeProperties: "Role");
                        if (assistant == null || assistant.OrganizationId != organizationId || assistant.Role?.Code != "ASSISTANT")
                            throw new BadRequestException("Trợ giảng không hợp lệ hoặc không tồn tại.");
                    }
                }

                var repo = _unitOfWork.Repository<Session>();
                await CheckConflictAsync(organizationId, request.TeacherId, request.AssistantIds, request.SessionDate, request.StartTime, request.EndTime);

                var session = new Session
                {
                    OrganizationId = organizationId,
                    ClassId = request.ClassId,
                    SchoolId = schoolId,
                    TeacherId = request.TeacherId,
                    AssistantId = request.AssistantIds?.FirstOrDefault(),
                    SessionAssistants = request.AssistantIds?.Select(aId => new SessionAssistant { AssistantId = aId }).ToList() ?? new List<SessionAssistant>(),
                    LessonTitle = request.LessonTitle,
                    RoomName = request.RoomName,
                    Notes = request.Notes,
                    ActualStudentCount = request.ActualStudentCount,
                    LocalTeachingAssistant = request.LocalTeachingAssistant,
                    LessonProgress = request.LessonProgress,
                    ExtraData = request.ExtraData,
                    SessionDate = request.SessionDate.Date.ToUniversalTime(),
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    StatusId = (await _unitOfWork.Repository<EduOps.Domain.Entities.SessionStatus>().FirstOrDefaultAsync(s => s.Code == "SCHEDULED"))?.Id
                };

                await repo.AddAsync(session);
                await _unitOfWork.CommitAsync();

                if (request.TeacherId.HasValue)
                {
                    await _notificationService.CreateAndSendAsync(
                        request.TeacherId.Value,
                        "Lịch dạy đột xuất",
                        $"Bạn được phân công dạy một buổi mới: {request.LessonTitle} vào ngày {request.SessionDate:dd/MM/yyyy}.",
                        "SYSTEM"
                    );
                }

                if (request.AssistantIds != null && request.AssistantIds.Any())
                {
                    foreach (var aId in request.AssistantIds)
                    {
                        await _notificationService.CreateAndSendAsync(
                            aId,
                            "Lịch trợ giảng đột xuất",
                            $"Bạn được phân công làm trợ giảng một buổi mới: {request.LessonTitle} vào ngày {request.SessionDate:dd/MM/yyyy}.",
                            "SYSTEM"
                        );
                    }
                }

                await _realtimeNotification.SendToOrganizationAsync(organizationId, "SessionUpdated");

                return session.ToDetailResponseDto();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create session with Conflict Detection.");
                throw;
            }
        }
        public async Task<List<SessionDetailResponseDto>> CreateBatchSessionsAsync(Guid organizationId, BatchCreateSessionRequestDto request)
        {
            if (request.ClassIds == null || !request.ClassIds.Any())
            {
                throw new BadRequestException("Phải chọn ít nhất một lớp học.");
            }

            var datesToCreate = new List<DateTime>();
            if (request.IsRecurring && request.RecurringEndDate.HasValue && request.RecurringDaysOfWeek != null && request.RecurringDaysOfWeek.Any())
            {
                for (var date = request.SessionDate.Date; date <= request.RecurringEndDate.Value.Date; date = date.AddDays(1))
                {
                    int dayOfWeek = date.DayOfWeek == DayOfWeek.Sunday ? 7 : (int)date.DayOfWeek;
                    if (request.RecurringDaysOfWeek.Contains(dayOfWeek))
                    {
                        datesToCreate.Add(date);
                    }
                }
                
                if (!datesToCreate.Any())
                {
                    throw new BadRequestException("Không có ngày nào hợp lệ trong khoảng thời gian lặp lại.");
                }
            }
            else
            {
                datesToCreate.Add(request.SessionDate.Date);
            }

            var createdSessions = new List<SessionDetailResponseDto>();
            foreach (var date in datesToCreate)
            {
                foreach (var classId in request.ClassIds)
                {
                    var singleRequest = new CreateSessionRequestDto
                    {
                        ClassId = classId,
                        SchoolId = request.SchoolId ?? Guid.Empty,
                        TeacherId = request.TeacherId,
                        AssistantIds = request.AssistantIds,
                        LessonTitle = request.LessonTitle,
                        RoomName = request.RoomName,
                        Notes = request.Notes,
                        ActualStudentCount = request.ActualStudentCount,
                        LocalTeachingAssistant = request.LocalTeachingAssistant,
                        LessonProgress = request.LessonProgress,
                        ExtraData = request.ExtraData,
                        SessionDate = date,
                        StartTime = request.StartTime,
                        EndTime = request.EndTime
                    };
                    
                    var createdSession = await CreateSessionAsync(organizationId, singleRequest);
                    createdSessions.Add(createdSession);
                }
            }
            
            return createdSessions;
        }

        public async Task<SessionDetailResponseDto> UpdateSessionAsync(Guid id, Guid organizationId, EduOps.Application.DTOs.Academic.SessionRequestDto request)
        {
            var repo = _unitOfWork.Repository<Session>();
            var session = await repo.FirstOrDefaultAsync(s => s.Id == id && s.OrganizationId == organizationId, includeProperties: "SessionAssistants");
            if (session == null) throw new NotFoundException("Session", id);

            // Ignore conflict check if Teacher/Assistant didn't change and time didn't change
            bool assistantsChanged = false;
            var currentAssistantIds = session.SessionAssistants.Select(sa => sa.AssistantId).ToList();
            if (request.AssistantIds == null)
            {
                assistantsChanged = currentAssistantIds.Any();
            }
            else
            {
                assistantsChanged = currentAssistantIds.Count != request.AssistantIds.Count || currentAssistantIds.Except(request.AssistantIds).Any();
            }

            bool timeOrStaffChanged = session.TeacherId != request.TeacherId || assistantsChanged || 
                                      session.SessionDate.Date != request.SessionDate.Date || 
                                      session.StartTime != request.StartTime || session.EndTime != request.EndTime;

            if (timeOrStaffChanged)
            {
                await CheckConflictAsync(organizationId, request.TeacherId, request.AssistantIds, request.SessionDate, request.StartTime, request.EndTime, id);
            }

            session.ClassId = request.ClassId;
            session.TeacherId = request.TeacherId;
            session.AssistantId = request.AssistantIds?.FirstOrDefault();
            
            // Update assistants
            session.SessionAssistants.Clear();
            if (request.AssistantIds != null && request.AssistantIds.Any())
            {
                foreach(var aid in request.AssistantIds)
                {
                    session.SessionAssistants.Add(new SessionAssistant { AssistantId = aid });
                }
            }

            session.LessonTitle = request.LessonTitle;
            session.RoomName = request.RoomName;
            session.Notes = request.Notes;
            session.ActualStudentCount = request.ActualStudentCount;
            session.LocalTeachingAssistant = request.LocalTeachingAssistant;
            session.LessonProgress = request.LessonProgress;
            session.ExtraData = request.ExtraData;
            session.SessionDate = request.SessionDate.Date.ToUniversalTime();
            session.StartTime = request.StartTime;
            session.EndTime = request.EndTime;

            repo.Update(session);
            await _unitOfWork.CommitAsync();
            await _realtimeNotification.SendToOrganizationAsync(organizationId, "SessionUpdated");
            return session.ToDetailResponseDto();
        }

        public async Task DeleteSessionAsync(Guid id, Guid organizationId)
        {
            var repo = _unitOfWork.Repository<Session>();
            var session = await repo.FirstOrDefaultAsync(s => s.Id == id && s.OrganizationId == organizationId);
            if (session == null) throw new NotFoundException("Session", id);

            repo.Remove(session);
            await _unitOfWork.CommitAsync();
            await _realtimeNotification.SendToOrganizationAsync(organizationId, "SessionUpdated");
        }

        public async Task<List<SessionDetailResponseDto>> ImportSessionsFromExcelAsync(Guid organizationId, ImportSessionRequestDto request)
        {
            var createdSessions = new List<SessionDetailResponseDto>();

            var schoolRepo = _unitOfWork.Repository<School>();
            var classRepo = _unitOfWork.Repository<Class>();
            var userRepo = _unitOfWork.Repository<User>();
            var sessionRepo = _unitOfWork.Repository<Session>();
            var roleRepo = _unitOfWork.Repository<Role>();
            var customFieldRepo = _unitOfWork.Repository<TenantCustomField>();
            var sessionStatusRepo = _unitOfWork.Repository<EduOps.Domain.Entities.SessionStatus>();

            var assistantRole = await roleRepo.FirstOrDefaultAsync(r => r.Code == "ASSISTANT");
            var teacherRole = await roleRepo.FirstOrDefaultAsync(r => r.Code == "TEACHER");
            var scheduledStatus = await sessionStatusRepo.FirstOrDefaultAsync(s => s.Code == "SCHEDULED");

            foreach (var file in request.Files)
            {
                using var stream = file.OpenReadStream();
                using var workbook = new XLWorkbook(stream);

            foreach (var worksheet in workbook.Worksheets)
            {
                var schoolName = worksheet.Name.Trim();
                var school = await schoolRepo.FirstOrDefaultAsync(s => s.Name.ToLower() == schoolName.ToLower() && s.OrganizationId == organizationId);
                
                if (school == null)
                {
                    if (!request.AutoCreateSchools) continue;
                    
                    school = new School { OrganizationId = organizationId, Name = schoolName };
                    await schoolRepo.AddAsync(school);
                    await _unitOfWork.CommitAsync(); // Commit immediately so we have an Id
                }

                var rows = worksheet.RowsUsed();
                if (!rows.Any()) continue;

                var headerRow = rows.First();
                var dataRows = rows.Skip(1);

                var columnMap = new Dictionary<string, int>();
                var customFieldsIndices = new Dictionary<int, string>();

                foreach (var cell in headerRow.CellsUsed())
                {
                    var headerText = cell.GetString().Trim();
                    var headerNormalized = headerText.ToLower().Replace(" ", "");

                    if (headerNormalized.Contains("ngày") || headerNormalized.Contains("date")) columnMap["Date"] = cell.Address.ColumnNumber;
                    else if (headerNormalized.Contains("thờigian") || headerNormalized.Contains("time") || headerNormalized.Contains("giờ")) columnMap["Time"] = cell.Address.ColumnNumber;
                    else if (headerNormalized.Contains("lớp") || headerNormalized.Contains("class")) columnMap["Class"] = cell.Address.ColumnNumber;
                    else if (headerNormalized.Contains("sĩsố") || headerNormalized.Contains("count") || headerNormalized.Contains("sốlượng")) columnMap["StudentCount"] = cell.Address.ColumnNumber;
                    else if (headerNormalized.Contains("trợgiảngtạimn") || headerNormalized.Contains("local") || headerNormalized.Contains("trợgiảngphụ")) columnMap["LocalAssistant"] = cell.Address.ColumnNumber;
                    else if (headerNormalized.Contains("trợgiảng") || headerNormalized.Contains("assistant") || headerNormalized.Contains("trợgiảng")) columnMap["Assistant"] = cell.Address.ColumnNumber;
                    else if (headerNormalized.Contains("tiếnđộ") || headerNormalized.Contains("progress") || headerNormalized.Contains("bàigiảng")) columnMap["LessonProgress"] = cell.Address.ColumnNumber;
                    else if (headerNormalized.Contains("nhậnxét") || headerNormalized.Contains("ghi") || headerNormalized.Contains("note")) columnMap["Notes"] = cell.Address.ColumnNumber;
                    else if (headerNormalized.Contains("giáoviên") || headerNormalized.Contains("gv") || headerNormalized.Contains("teacher")) columnMap["Teacher"] = cell.Address.ColumnNumber;
                    else 
                    {
                        if (!string.IsNullOrEmpty(headerText))
                        {
                            var lower = headerText.ToLower().Trim();
                            bool isGarbage = false;
                            if (System.Text.RegularExpressions.Regex.IsMatch(lower, @"^cột\s*\d*$") || System.Text.RegularExpressions.Regex.IsMatch(lower, @"^column\s*\d*$"))
                            {
                                bool hasData = false;
                                foreach(var r in dataRows)
                                {
                                    if(!string.IsNullOrWhiteSpace(r.Cell(cell.Address.ColumnNumber).GetString()))
                                    {
                                        hasData = true;
                                        break;
                                    }
                                }
                                if(!hasData) isGarbage = true;
                            }
                            if (!isGarbage)
                            {
                                customFieldsIndices[cell.Address.ColumnNumber] = headerText;
                            }
                        }
                    }
                }


                foreach (var kvp in customFieldsIndices)
                {
                    var fieldName = kvp.Value;
                    if (request.AutoCreateCustomFields)
                    {
                        var existingCf = await customFieldRepo.FirstOrDefaultAsync(cf => cf.OrganizationId == organizationId && cf.FieldName.ToLower() == fieldName.ToLower());
                        if (existingCf == null)
                        {
                            await customFieldRepo.AddAsync(new TenantCustomField
                            {
                                OrganizationId = organizationId,
                                EntityName = "Session",
                                FieldName = fieldName,
                                FieldType = "Text"
                            });
                        }
                    }
                }
                await _unitOfWork.CommitAsync();

                foreach (var row in dataRows)
                {
                    var dateStr = columnMap.ContainsKey("Date") ? row.Cell(columnMap["Date"]).GetString().Trim() : "";
                    var timeStr = columnMap.ContainsKey("Time") ? row.Cell(columnMap["Time"]).GetString().Trim() : "";
                    var classStr = columnMap.ContainsKey("Class") ? row.Cell(columnMap["Class"]).GetString().Trim() : "";
                    var studentCountStr = columnMap.ContainsKey("StudentCount") ? row.Cell(columnMap["StudentCount"]).GetString().Trim() : "";
                    var teacherStr = columnMap.ContainsKey("Teacher") ? row.Cell(columnMap["Teacher"]).GetString().Trim() : "";
                    var assistantStr = columnMap.ContainsKey("Assistant") ? row.Cell(columnMap["Assistant"]).GetString().Trim() : "";
                    var localAssistantStr = columnMap.ContainsKey("LocalAssistant") ? row.Cell(columnMap["LocalAssistant"]).GetString().Trim() : "";
                    var progressStr = columnMap.ContainsKey("LessonProgress") ? row.Cell(columnMap["LessonProgress"]).GetString().Trim() : "";
                    var notesStr = columnMap.ContainsKey("Notes") ? row.Cell(columnMap["Notes"]).GetString().Trim() : "";

                    var extraDataDict = new Dictionary<string, string>();
                    foreach (var kvp in customFieldsIndices)
                    {
                        var val = row.Cell(kvp.Key).GetString().Trim();
                        if (!string.IsNullOrEmpty(val))
                        {
                            extraDataDict[kvp.Value] = val;
                        }
                    }
                    string? extraDataJson = extraDataDict.Count > 0 ? System.Text.Json.JsonSerializer.Serialize(extraDataDict) : null;

                    if (string.IsNullOrEmpty(dateStr) || string.IsNullOrEmpty(timeStr) || string.IsNullOrEmpty(classStr))
                        continue;

                    // Parse Date
                    if (!DateTime.TryParseExact(dateStr, new[] {"dd/MM/yyyy", "d/M/yyyy"}, null, System.Globalization.DateTimeStyles.None, out var sessionDate))
                    {
                        if (DateTime.TryParse(dateStr, out var d)) sessionDate = d;
                        else continue;
                    }

                    // Parse Time
                    var timeParts = timeStr.Split(new string[] { "-", "đến" }, StringSplitOptions.RemoveEmptyEntries);
                    TimeSpan startTime = TimeSpan.Zero, endTime = TimeSpan.Zero;
                    if (timeParts.Length >= 2)
                    {
                        startTime = ParseTimeSpan(timeParts[0]);
                        endTime = ParseTimeSpan(timeParts[1]);
                    }

                    // Parse Student Count
                    int? totalStudentCount = int.TryParse(studentCountStr, out var count) ? count : (int?)null;

                    // Parse Classes
                    var rawClassNames = classStr.Split(new[] { '+', ',' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.Trim()).ToList();
                    var classNames = new List<string>();
                    string currentPrefix = "";
                    foreach (var rawName in rawClassNames)
                    {
                        if (string.IsNullOrEmpty(rawName)) continue;
                        if (char.IsLetter(rawName[0]))
                        {
                            int firstDigit = rawName.ToList().FindIndex(char.IsDigit);
                            if (firstDigit > 0) currentPrefix = rawName.Substring(0, firstDigit).TrimEnd() + " ";
                            else currentPrefix = "";
                            classNames.Add(rawName);
                        }
                        else if (char.IsDigit(rawName[0]) && !string.IsNullOrEmpty(currentPrefix))
                        {
                            classNames.Add(currentPrefix + rawName);
                        }
                        else
                        {
                            classNames.Add(rawName);
                        }
                    }

                    int? studentsPerClass = classNames.Count > 0 && totalStudentCount.HasValue ? totalStudentCount.Value / classNames.Count : (int?)null;

                    var classEntities = new List<Class>();
                    foreach (var cName in classNames)
                    {
                        var cls = await classRepo.FirstOrDefaultAsync(c => c.Name.ToLower() == cName.ToLower() && c.SchoolId == school.Id);
                        if (cls == null)
                        {
                            if (!request.AutoCreateClasses) continue;
                            cls = new Class { OrganizationId = organizationId, SchoolId = school.Id, Name = cName };
                            await classRepo.AddAsync(cls);
                            await _unitOfWork.CommitAsync();
                        }
                        classEntities.Add(cls);
                    }

                    if (classEntities.Count == 0) continue;

                    // Parse Assistants
                    var assistantNames = assistantStr.Split(new[] { '+', ',' }, StringSplitOptions.RemoveEmptyEntries).Select(a => a.Trim()).ToList();
                    var assistantUsers = new List<User>();
                    
                    foreach (var aName in assistantNames)
                    {
                        var email = GenerateEmailFromName(aName);
                        var user = await userRepo.FirstOrDefaultAsync(u => u.Email == email && u.OrganizationId == organizationId);
                        
                        if (user == null)
                        {
                            if (!request.AutoCreateUsers) continue;
                            user = new User
                            {
                                OrganizationId = organizationId,
                                FullName = aName,
                                Email = email,
                                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                                RoleId = assistantRole?.Id
                            };
                            await userRepo.AddAsync(user);
                            await _unitOfWork.CommitAsync();
                        }
                        assistantUsers.Add(user);
                    }

                    // Parse Teacher
                    Guid? assignedTeacherId = null;
                    if (!string.IsNullOrEmpty(teacherStr))
                    {
                        var email = GenerateEmailFromName(teacherStr);
                        var user = await userRepo.FirstOrDefaultAsync(u => u.Email == email && u.OrganizationId == organizationId);
                        
                        if (user == null && request.AutoCreateUsers)
                        {
                            user = new User
                            {
                                OrganizationId = organizationId,
                                FullName = teacherStr,
                                Email = email,
                                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                                RoleId = teacherRole?.Id
                            };
                            await userRepo.AddAsync(user);
                            await _unitOfWork.CommitAsync();
                        }
                        assignedTeacherId = user?.Id;
                    }

                    // Create Sessions
                    foreach (var cls in classEntities)
                    {
                        var session = new Session
                        {
                            OrganizationId = organizationId,
                            SchoolId = school.Id,
                            ClassId = cls.Id,
                            TeacherId = assignedTeacherId,
                            SessionDate = sessionDate.ToUniversalTime(),
                            StartTime = startTime,
                            EndTime = endTime,
                            ActualStudentCount = studentsPerClass,
                            LocalTeachingAssistant = localAssistantStr,
                            LessonProgress = progressStr,
                            Notes = notesStr,
                            ExtraData = extraDataJson,
                            StatusId = (await _unitOfWork.Repository<EduOps.Domain.Entities.SessionStatus>().FirstOrDefaultAsync(s => s.Code == "SCHEDULED"))?.Id
                        };

                        // Add assistants
                        foreach (var au in assistantUsers)
                        {
                            session.SessionAssistants.Add(new SessionAssistant
                            {
                                OrganizationId = organizationId,
                                AssistantId = au.Id
                            });
                        }
                        
                        // Set the first assistant as the primary AssistantId for backward compatibility
                        if (assistantUsers.Count > 0) session.AssistantId = assistantUsers.First().Id;

                        await sessionRepo.AddAsync(session);
                    }
                    }
                }
            }
            
            await _unitOfWork.CommitAsync();
            await _realtimeNotification.SendToOrganizationAsync(organizationId, "SessionUpdated");
            return createdSessions;
        }

        public async Task<EduOps.Application.DTOs.Academic.Sessions.Responses.SessionImportPreviewResponseDto> PreviewImportSessionsFromExcelAsync(Guid organizationId, ImportSessionRequestDto request)
        {
            var preview = new EduOps.Application.DTOs.Academic.Sessions.Responses.SessionImportPreviewResponseDto();

            var schoolRepo = _unitOfWork.Repository<School>();
            var classRepo = _unitOfWork.Repository<Class>();
            var userRepo = _unitOfWork.Repository<User>();
            var customFieldRepo = _unitOfWork.Repository<TenantCustomField>();

            foreach (var file in request.Files)
            {
                using var stream = file.OpenReadStream();
                using var workbook = new XLWorkbook(stream);

            foreach (var worksheet in workbook.Worksheets)
            {
                var schoolName = worksheet.Name.Trim();
                var school = await schoolRepo.FirstOrDefaultAsync(s => s.Name.ToLower() == schoolName.ToLower() && s.OrganizationId == organizationId);
                
                string? currentSchoolTempId = null;
                if (school == null && request.AutoCreateSchools)
                {
                    // Check if already in preview to avoid duplicates
                    var existingPreviewSchool = preview.SchoolsToCreate.FirstOrDefault(s => s.Name.ToLower() == schoolName.ToLower());
                    if (existingPreviewSchool == null)
                    {
                        existingPreviewSchool = new EduOps.Application.DTOs.Academic.Sessions.Responses.NewSchoolPreviewDto { Name = schoolName };
                        preview.SchoolsToCreate.Add(existingPreviewSchool);
                    }
                    currentSchoolTempId = existingPreviewSchool.TempId;
                }

                var rows = worksheet.RowsUsed();
                if (!rows.Any()) continue;

                var headerRow = rows.First();
                var dataRows = rows.Skip(1);

                var columnMap = new Dictionary<string, int>();
                var customFieldsIndices = new Dictionary<int, string>();

                var headerList = new List<string>();
                var headerCellMap = new Dictionary<string, int>();

                foreach (var cell in headerRow.CellsUsed())
                {
                    var headerText = cell.GetString().Trim();
                    if (!string.IsNullOrEmpty(headerText))
                    {
                        headerList.Add(headerText);
                        headerCellMap[headerText] = cell.Address.ColumnNumber;
                    }
                }

                // Call AI to map headers
                Console.WriteLine($"[AI EXCEL MAPPING] Đang gửi danh sách {headerList.Count} cột lên AI để phân tích...");
                var aiMap = await _aiMappingService.MapExcelHeadersAsync(headerList);

                if (aiMap != null && aiMap.Count > 0 && aiMap.Values.Any(v => !string.IsNullOrEmpty(v)))
                {
                    Console.WriteLine($"[AI EXCEL MAPPING] AI trả về kết quả thành công: {System.Text.Json.JsonSerializer.Serialize(aiMap)}");
                    // AI responded, use AI Map
                    if (aiMap.TryGetValue("Date", out var vDate) && !string.IsNullOrEmpty(vDate) && headerCellMap.ContainsKey(vDate)) columnMap["Date"] = headerCellMap[vDate];
                    if (aiMap.TryGetValue("Time", out var vTime) && !string.IsNullOrEmpty(vTime) && headerCellMap.ContainsKey(vTime)) columnMap["Time"] = headerCellMap[vTime];
                    if (aiMap.TryGetValue("Class", out var vClass) && !string.IsNullOrEmpty(vClass) && headerCellMap.ContainsKey(vClass)) columnMap["Class"] = headerCellMap[vClass];
                    if (aiMap.TryGetValue("StudentCount", out var vStudentCount) && !string.IsNullOrEmpty(vStudentCount) && headerCellMap.ContainsKey(vStudentCount)) columnMap["StudentCount"] = headerCellMap[vStudentCount];
                    if (aiMap.TryGetValue("Teacher", out var vTeacher) && !string.IsNullOrEmpty(vTeacher) && headerCellMap.ContainsKey(vTeacher)) columnMap["Teacher"] = headerCellMap[vTeacher];
                    if (aiMap.TryGetValue("LocalAssistant", out var vLocalAssistant) && !string.IsNullOrEmpty(vLocalAssistant) && headerCellMap.ContainsKey(vLocalAssistant)) columnMap["LocalAssistant"] = headerCellMap[vLocalAssistant];
                    if (aiMap.TryGetValue("Assistant", out var vAssistant) && !string.IsNullOrEmpty(vAssistant) && headerCellMap.ContainsKey(vAssistant)) columnMap["Assistant"] = headerCellMap[vAssistant];
                    if (aiMap.TryGetValue("LessonProgress", out var vLessonProgress) && !string.IsNullOrEmpty(vLessonProgress) && headerCellMap.ContainsKey(vLessonProgress)) columnMap["LessonProgress"] = headerCellMap[vLessonProgress];
                    if (aiMap.TryGetValue("Notes", out var vNotes) && !string.IsNullOrEmpty(vNotes) && headerCellMap.ContainsKey(vNotes)) columnMap["Notes"] = headerCellMap[vNotes];

                    // Remaining headers go to Custom Fields
                    var mappedColumns = new HashSet<int>(columnMap.Values);
                    foreach (var cell in headerRow.CellsUsed())
                    {
                        if (!mappedColumns.Contains(cell.Address.ColumnNumber))
                        {
                            var headerText = cell.GetString().Trim();
                            if (!string.IsNullOrEmpty(headerText))
                            {
                                var lower = headerText.ToLower().Trim();
                                bool isGarbage = false;
                                if (System.Text.RegularExpressions.Regex.IsMatch(lower, @"^cột\s*\d*$") || System.Text.RegularExpressions.Regex.IsMatch(lower, @"^column\s*\d*$"))
                                {
                                    bool hasData = false;
                                    foreach(var r in dataRows)
                                    {
                                        if(!string.IsNullOrWhiteSpace(r.Cell(cell.Address.ColumnNumber).GetString()))
                                        {
                                            hasData = true;
                                            break;
                                        }
                                    }
                                    if(!hasData) isGarbage = true;
                                }
                                if (!isGarbage)
                                {
                                    customFieldsIndices[cell.Address.ColumnNumber] = headerText;
                                }
                            }
                        }
                    }
                }
                else
                {
                    Console.WriteLine($"[AI EXCEL MAPPING] AI không trả về kết quả hoặc bị lỗi. Chuyển sang sử dụng Rule-based dự phòng.");
                    // Fallback to Rule-based Auto Mapping
                    foreach (var cell in headerRow.CellsUsed())
                    {
                        var headerText = cell.GetString().Trim();
                        var headerNormalized = headerText.ToLower().Replace(" ", "");

                        if (headerNormalized.Contains("ngày") || headerNormalized.Contains("date")) columnMap["Date"] = cell.Address.ColumnNumber;
                        else if (headerNormalized.Contains("thờigian") || headerNormalized.Contains("time") || headerNormalized.Contains("giờ")) columnMap["Time"] = cell.Address.ColumnNumber;
                        else if (headerNormalized.Contains("lớp") || headerNormalized.Contains("class")) columnMap["Class"] = cell.Address.ColumnNumber;
                        else if (headerNormalized.Contains("sĩsố") || headerNormalized.Contains("count") || headerNormalized.Contains("sốlượng")) columnMap["StudentCount"] = cell.Address.ColumnNumber;
                        else if (headerNormalized.Contains("giáoviên") || headerNormalized == "gv" || headerNormalized.Contains("teacher")) columnMap["Teacher"] = cell.Address.ColumnNumber;
                        else if (headerNormalized.Contains("trợgiảngtạimn") || headerNormalized.Contains("trợgiảngmn") || headerNormalized.Contains("local") || headerNormalized.EndsWith("tgmn")) columnMap["LocalAssistant"] = cell.Address.ColumnNumber;
                        else if (headerNormalized.Contains("trợgiảng") || headerNormalized.Contains("assistant") || headerNormalized == "tg") columnMap["Assistant"] = cell.Address.ColumnNumber;
                        else if (headerNormalized.Contains("tiếnđộ") || headerNormalized.Contains("progress") || headerNormalized.Contains("bàigiảng")) columnMap["LessonProgress"] = cell.Address.ColumnNumber;
                        else if (headerNormalized.Contains("nhậnxét") || headerNormalized.Contains("ghi") || headerNormalized.Contains("note")) columnMap["Notes"] = cell.Address.ColumnNumber;
                        else 
                        {
                            if (!string.IsNullOrEmpty(headerText))
                            {
                                var lower = headerText.ToLower().Trim();
                                bool isGarbage = false;
                                if (System.Text.RegularExpressions.Regex.IsMatch(lower, @"^cột\s*\d*$") || System.Text.RegularExpressions.Regex.IsMatch(lower, @"^column\s*\d*$"))
                                {
                                    bool hasData = false;
                                    foreach(var r in dataRows)
                                    {
                                        if(!string.IsNullOrWhiteSpace(r.Cell(cell.Address.ColumnNumber).GetString()))
                                        {
                                            hasData = true;
                                            break;
                                        }
                                    }
                                    if(!hasData) isGarbage = true;
                                }
                                if (!isGarbage)
                                {
                                    customFieldsIndices[cell.Address.ColumnNumber] = headerText;
                                }
                            }
                        }
                    }
                }

                if (request.AutoCreateCustomFields)
                {
                    foreach (var kvp in customFieldsIndices)
                    {
                        var fieldName = kvp.Value;
                        var existingCf = await customFieldRepo.FirstOrDefaultAsync(cf => cf.OrganizationId == organizationId && cf.FieldName.ToLower() == fieldName.ToLower());
                        if (existingCf == null && !preview.CustomFieldsToCreate.Any(cf => cf.FieldName.ToLower() == fieldName.ToLower()))
                        {
                            preview.CustomFieldsToCreate.Add(new EduOps.Application.DTOs.Academic.Sessions.Responses.NewCustomFieldPreviewDto { FieldName = fieldName });
                        }
                    }
                }

                foreach (var row in dataRows)
                {
                    var dateStr = columnMap.ContainsKey("Date") ? row.Cell(columnMap["Date"]).GetString().Trim() : "";
                    var timeStr = columnMap.ContainsKey("Time") ? row.Cell(columnMap["Time"]).GetString().Trim() : "";
                    var classStr = columnMap.ContainsKey("Class") ? row.Cell(columnMap["Class"]).GetString().Trim() : "";
                    var studentCountStr = columnMap.ContainsKey("StudentCount") ? row.Cell(columnMap["StudentCount"]).GetString().Trim() : "";
                    var teacherStr = columnMap.ContainsKey("Teacher") ? row.Cell(columnMap["Teacher"]).GetString().Trim() : "";
                    var assistantStr = columnMap.ContainsKey("Assistant") ? row.Cell(columnMap["Assistant"]).GetString().Trim() : "";
                    var localAssistantStr = columnMap.ContainsKey("LocalAssistant") ? row.Cell(columnMap["LocalAssistant"]).GetString().Trim() : "";
                    var progressStr = columnMap.ContainsKey("LessonProgress") ? row.Cell(columnMap["LessonProgress"]).GetString().Trim() : "";
                    var notesStr = columnMap.ContainsKey("Notes") ? row.Cell(columnMap["Notes"]).GetString().Trim() : "";

                    var extraDataDict = new Dictionary<string, string>();
                    foreach (var kvp in customFieldsIndices)
                    {
                        var val = row.Cell(kvp.Key).GetString().Trim();
                        extraDataDict[kvp.Value] = val; // Cho phép rỗng để UI hiển thị cột này trong form Edit
                    }

                    if (string.IsNullOrEmpty(dateStr) || string.IsNullOrEmpty(timeStr) || string.IsNullOrEmpty(classStr))
                        continue;

                    var errors = new List<string>();

                    if (!DateTime.TryParseExact(dateStr, new[] {"dd/MM/yyyy", "d/M/yyyy"}, null, System.Globalization.DateTimeStyles.None, out var sessionDate))
                    {
                        if (DateTime.TryParse(dateStr, out var d)) sessionDate = d;
                        else { errors.Add($"Ngày không hợp lệ: {dateStr}"); sessionDate = DateTime.Today; }
                    }

                    var timeParts = timeStr.Split(new string[] { "-", "đến" }, StringSplitOptions.RemoveEmptyEntries);
                    TimeSpan startTime = TimeSpan.Zero, endTime = TimeSpan.Zero;
                    if (timeParts.Length >= 2)
                    {
                        startTime = ParseTimeSpan(timeParts[0]);
                        endTime = ParseTimeSpan(timeParts[1]);
                    }
                    else { errors.Add($"Giờ không hợp lệ: {timeStr}"); }

                    int? totalStudentCount = int.TryParse(studentCountStr, out var count) ? count : (int?)null;

                    var rawClassNames = classStr.Split(new[] { '+', ',' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.Trim()).ToList();
                    var classNames = new List<string>();
                    string currentPrefix = "";
                    foreach (var rawName in rawClassNames)
                    {
                        if (string.IsNullOrEmpty(rawName)) continue;
                        if (char.IsLetter(rawName[0]))
                        {
                            int firstDigit = rawName.ToList().FindIndex(char.IsDigit);
                            if (firstDigit > 0) currentPrefix = rawName.Substring(0, firstDigit).TrimEnd() + " ";
                            else currentPrefix = "";
                            classNames.Add(rawName);
                        }
                        else if (char.IsDigit(rawName[0]) && !string.IsNullOrEmpty(currentPrefix))
                            classNames.Add(currentPrefix + rawName);
                        else
                            classNames.Add(rawName);
                    }

                    int? studentsPerClass = classNames.Count > 0 && totalStudentCount.HasValue ? totalStudentCount.Value / classNames.Count : (int?)null;

                    var classPreviewDtos = new List<EduOps.Application.DTOs.Academic.Sessions.Responses.NewClassPreviewDto>();
                    foreach (var cName in classNames)
                    {
                        EduOps.Domain.Entities.Class? cls = null;
                        if (school != null)
                        {
                            cls = await classRepo.FirstOrDefaultAsync(c => c.Name.ToLower() == cName.ToLower() && c.SchoolId == school.Id && c.OrganizationId == organizationId);
                        }
                        string? currentClassTempId = null;
                        
                        if (cls == null)
                        {
                            if (request.AutoCreateClasses)
                            {
                                var existingPreviewClass = preview.ClassesToCreate.FirstOrDefault(c => c.Name.ToLower() == cName.ToLower() && c.SchoolName.ToLower() == schoolName.ToLower());
                                if (existingPreviewClass == null)
                                {
                                    existingPreviewClass = new EduOps.Application.DTOs.Academic.Sessions.Responses.NewClassPreviewDto { Name = cName, SchoolName = schoolName, SchoolTempId = currentSchoolTempId };
                                    preview.ClassesToCreate.Add(existingPreviewClass);
                                }
                                currentClassTempId = existingPreviewClass.TempId;
                            }
                            else
                            {
                                errors.Add($"Không tìm thấy lớp: {cName}");
                            }
                        }
                        
                        classPreviewDtos.Add(new EduOps.Application.DTOs.Academic.Sessions.Responses.NewClassPreviewDto { Name = cName, TempId = currentClassTempId });
                    }

                    // Process Teacher
                    string? teacherTempId = null;
                    if (!string.IsNullOrEmpty(teacherStr))
                    {
                        var email = GenerateEmailFromName(teacherStr);
                        var user = await userRepo.FirstOrDefaultAsync(u => u.Email == email && u.OrganizationId == organizationId);
                        if (user == null && request.AutoCreateUsers)
                        {
                            var existingPreviewTeacher = preview.UsersToCreate.FirstOrDefault(u => u.Email == email);
                            if (existingPreviewTeacher == null)
                            {
                                existingPreviewTeacher = new EduOps.Application.DTOs.Academic.Sessions.Responses.NewUserPreviewDto { FullName = teacherStr, Email = email, RoleCode = "TEACHER" };
                                preview.UsersToCreate.Add(existingPreviewTeacher);
                            }
                            teacherTempId = existingPreviewTeacher.TempId;
                        }
                    }

                    // Process Assistants
                    var assistantNames = assistantStr.Split(new[] { '+', ',' }, StringSplitOptions.RemoveEmptyEntries).Select(a => a.Trim()).ToList();
                    var assistantTempIds = new List<string>();
                    
                    foreach (var aName in assistantNames)
                    {
                        var email = GenerateEmailFromName(aName);
                        var user = await userRepo.FirstOrDefaultAsync(u => u.Email == email && u.OrganizationId == organizationId);
                        if (user == null && request.AutoCreateUsers)
                        {
                            var existingPreviewAsst = preview.UsersToCreate.FirstOrDefault(u => u.Email == email);
                            if (existingPreviewAsst == null)
                            {
                                existingPreviewAsst = new EduOps.Application.DTOs.Academic.Sessions.Responses.NewUserPreviewDto { FullName = aName, Email = email, RoleCode = "ASSISTANT" };
                                preview.UsersToCreate.Add(existingPreviewAsst);
                            }
                            if (!string.IsNullOrEmpty(existingPreviewAsst.TempId))
                            {
                                assistantTempIds.Add(existingPreviewAsst.TempId);
                            }
                        }
                    }

                    foreach (var cls in classPreviewDtos)
                    {
                        preview.Sessions.Add(new EduOps.Application.DTOs.Academic.Sessions.Responses.SessionPreviewDto
                        {
                            SessionDate = sessionDate,
                            StartTime = startTime,
                            EndTime = endTime,
                            ClassName = cls.Name,
                            ClassTempId = cls.TempId,
                            SchoolName = schoolName,
                            SchoolTempId = currentSchoolTempId,
                            TeacherName = string.IsNullOrEmpty(teacherStr) ? null : teacherStr,
                            TeacherTempId = teacherTempId,
                            AssistantNames = assistantNames,
                            AssistantTempIds = assistantTempIds,
                            ActualStudentCount = studentsPerClass,
                            LocalTeachingAssistant = localAssistantStr,
                            LessonProgress = progressStr,
                            Notes = notesStr,
                            ExtraData = extraDataDict,
                            Errors = errors.ToList()
                        });
                    }
                }
                }
            }

            return preview;
        }

        public async Task<List<SessionDetailResponseDto>> ConfirmImportSessionsAsync(Guid organizationId, EduOps.Application.DTOs.Academic.Sessions.Responses.SessionImportPreviewResponseDto request)
        {
            var createdSessions = new List<SessionDetailResponseDto>();
            
            var schoolRepo = _unitOfWork.Repository<School>();
            var classRepo = _unitOfWork.Repository<Class>();
            var userRepo = _unitOfWork.Repository<User>();
            var customFieldRepo = _unitOfWork.Repository<TenantCustomField>();
            var roleRepo = _unitOfWork.Repository<Role>();
            var sessionRepo = _unitOfWork.Repository<Session>();
            var sessionStatusRepo = _unitOfWork.Repository<EduOps.Domain.Entities.SessionStatus>();

            var assistantRole = await roleRepo.FirstOrDefaultAsync(r => r.Code == "ASSISTANT");
            var teacherRole = await roleRepo.FirstOrDefaultAsync(r => r.Code == "TEACHER");
            var scheduledStatus = await sessionStatusRepo.FirstOrDefaultAsync(s => s.Code == "SCHEDULED");

            var tempIdToRealIdMap = new Dictionary<string, Guid>();

            // 1. Create Custom Fields
            if (request.CustomFieldsToCreate != null)
            {
                foreach (var cf in request.CustomFieldsToCreate)
                {
                    var existingCf = await customFieldRepo.FirstOrDefaultAsync(c => c.OrganizationId == organizationId && c.FieldName.ToLower() == cf.FieldName.ToLower());
                    if (existingCf == null)
                    {
                        var newCf = new TenantCustomField { OrganizationId = organizationId, EntityName = "Session", FieldName = cf.FieldName, FieldType = "Text" };
                        await customFieldRepo.AddAsync(newCf);
                        await _unitOfWork.CommitAsync();
                    }
                }
            }

            // 2. Create Users
            if (request.UsersToCreate != null)
            {
                foreach (var user in request.UsersToCreate)
                {
                    var existingUser = await userRepo.FirstOrDefaultAsync(u => u.Email == user.Email && u.OrganizationId == organizationId);
                    if (existingUser == null)
                    {
                        var newUser = new User
                        {
                            OrganizationId = organizationId,
                            FullName = user.FullName,
                            Email = user.Email,
                            PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.DefaultPassword),
                            RoleId = user.RoleCode == "TEACHER" ? teacherRole?.Id : assistantRole?.Id
                        };
                        await userRepo.AddAsync(newUser);
                        await _unitOfWork.CommitAsync();
                        if (!string.IsNullOrEmpty(user.TempId)) tempIdToRealIdMap[user.TempId] = newUser.Id;
                    }
                    else
                    {
                        if (!string.IsNullOrEmpty(user.TempId)) tempIdToRealIdMap[user.TempId] = existingUser.Id;
                    }
                }
            }

            // 3. Create Schools
            if (request.SchoolsToCreate != null)
            {
                foreach (var school in request.SchoolsToCreate)
                {
                    var existingSchool = await schoolRepo.FirstOrDefaultAsync(s => s.Name.ToLower() == school.Name.ToLower() && s.OrganizationId == organizationId);
                    if (existingSchool == null)
                    {
                        var newSchool = new School { OrganizationId = organizationId, Name = school.Name };
                        await schoolRepo.AddAsync(newSchool);
                        await _unitOfWork.CommitAsync();
                        if (!string.IsNullOrEmpty(school.TempId)) tempIdToRealIdMap[school.TempId] = newSchool.Id;
                    }
                    else
                    {
                        if (!string.IsNullOrEmpty(school.TempId)) tempIdToRealIdMap[school.TempId] = existingSchool.Id;
                    }
                }
            }

            // 4. Create Classes
            if (request.ClassesToCreate != null)
            {
                foreach (var cls in request.ClassesToCreate)
                {
                    Guid schoolId = Guid.Empty;
                    if (!string.IsNullOrEmpty(cls.SchoolTempId) && tempIdToRealIdMap.ContainsKey(cls.SchoolTempId)) schoolId = tempIdToRealIdMap[cls.SchoolTempId];
                    else
                    {
                        var existingSchool = await schoolRepo.FirstOrDefaultAsync(s => s.Name.ToLower() == cls.SchoolName.ToLower() && s.OrganizationId == organizationId);
                        if (existingSchool != null) schoolId = existingSchool.Id;
                    }

                    if (schoolId != Guid.Empty)
                    {
                        var existingClass = await classRepo.FirstOrDefaultAsync(c => c.Name.ToLower() == cls.Name.ToLower() && c.SchoolId == schoolId);
                        if (existingClass == null)
                        {
                            var newClass = new Class { OrganizationId = organizationId, SchoolId = schoolId, Name = cls.Name };
                            await classRepo.AddAsync(newClass);
                            await _unitOfWork.CommitAsync();
                            if (!string.IsNullOrEmpty(cls.TempId)) tempIdToRealIdMap[cls.TempId] = newClass.Id;
                        }
                        else
                        {
                            if (!string.IsNullOrEmpty(cls.TempId)) tempIdToRealIdMap[cls.TempId] = existingClass.Id;
                        }
                    }
                }
            }

            // 5. Create Sessions
            if (request.Sessions != null)
            {
                foreach (var session in request.Sessions)
                {
                    if (session.Errors != null && session.Errors.Any()) continue;

                    Guid classId = Guid.Empty;
                    Guid schoolId = Guid.Empty;

                    if (!string.IsNullOrEmpty(session.ClassTempId) && tempIdToRealIdMap.ContainsKey(session.ClassTempId)) classId = tempIdToRealIdMap[session.ClassTempId];
                    else
                    {
                        var schoolMatch = await schoolRepo.FirstOrDefaultAsync(s => s.Name.ToLower() == session.SchoolName.ToLower() && s.OrganizationId == organizationId);
                        if (schoolMatch != null)
                        {
                            schoolId = schoolMatch.Id;
                            var classMatch = await classRepo.FirstOrDefaultAsync(c => c.Name.ToLower() == session.ClassName.ToLower() && c.SchoolId == schoolId);
                            if (classMatch != null) classId = classMatch.Id;
                        }
                    }

                    if (classId == Guid.Empty) continue;

                    if (schoolId == Guid.Empty)
                    {
                        var c = await classRepo.FirstOrDefaultAsync(x => x.Id == classId);
                        if (c != null) schoolId = c.SchoolId;
                    }

                    Guid? teacherId = null;
                    if (!string.IsNullOrEmpty(session.TeacherTempId) && tempIdToRealIdMap.ContainsKey(session.TeacherTempId)) teacherId = tempIdToRealIdMap[session.TeacherTempId];
                    else if (!string.IsNullOrEmpty(session.TeacherName))
                    {
                        var email = GenerateEmailFromName(session.TeacherName);
                        var u = await userRepo.FirstOrDefaultAsync(x => x.Email == email && x.OrganizationId == organizationId);
                        if (u != null) teacherId = u.Id;
                    }

                    var newSession = new Session
                    {
                        OrganizationId = organizationId,
                        SchoolId = schoolId,
                        ClassId = classId,
                        TeacherId = teacherId,
                        SessionDate = session.SessionDate.ToUniversalTime(),
                        StartTime = session.StartTime,
                        EndTime = session.EndTime,
                        ActualStudentCount = session.ActualStudentCount,
                        LocalTeachingAssistant = session.LocalTeachingAssistant,
                        LessonProgress = session.LessonProgress,
                        Notes = session.Notes,
                        ExtraData = session.ExtraData != null && session.ExtraData.Count > 0 ? System.Text.Json.JsonSerializer.Serialize(session.ExtraData) : null,
                        StatusId = scheduledStatus?.Id
                    };

                    if (session.AssistantTempIds != null)
                    {
                        foreach (var aTempId in session.AssistantTempIds)
                        {
                            if (tempIdToRealIdMap.ContainsKey(aTempId))
                            {
                                newSession.SessionAssistants.Add(new SessionAssistant { OrganizationId = organizationId, AssistantId = tempIdToRealIdMap[aTempId] });
                            }
                        }
                    }
                    if (session.AssistantNames != null)
                    {
                        foreach (var aName in session.AssistantNames)
                        {
                            var email = GenerateEmailFromName(aName);
                            var u = await userRepo.FirstOrDefaultAsync(x => x.Email == email && x.OrganizationId == organizationId);
                            if (u != null && !newSession.SessionAssistants.Any(sa => sa.AssistantId == u.Id))
                            {
                                newSession.SessionAssistants.Add(new SessionAssistant { OrganizationId = organizationId, AssistantId = u.Id });
                            }
                        }
                    }
                    
                    if (newSession.SessionAssistants.Count > 0) newSession.AssistantId = newSession.SessionAssistants.First().AssistantId;

                    await sessionRepo.AddAsync(newSession);
                    await _unitOfWork.CommitAsync();
                    createdSessions.Add(newSession.ToDetailResponseDto());
                }
            }

            return createdSessions;
        }

        private string RemoveDiacritics(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return text;
            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder(capacity: normalizedString.Length);
            for (int i = 0; i < normalizedString.Length; i++)
            {
                char c = normalizedString[i];
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }
            return stringBuilder.ToString().Normalize(NormalizationForm.FormC).Replace("đ", "d").Replace("Đ", "D");
        }

        private string GenerateEmailFromName(string fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName)) return "unknown@eduops.vn";
            var cleanName = RemoveDiacritics(fullName);
            var parts = cleanName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 1) return parts[0].ToLower() + "@eduops.vn";
            
            var last = parts.Last().ToLower();
            var initials = string.Join("", parts.Take(parts.Length - 1).Select(p => p.Substring(0, 1).ToLower()));
            return $"{last}{initials}@eduops.vn";
        }

        private TimeSpan ParseTimeSpan(string timeStr)
        {
            timeStr = timeStr.Trim().ToLower().Replace("h", ":").Replace("g", ":");
            if (!timeStr.Contains(":")) timeStr += ":00";
            if (TimeSpan.TryParse(timeStr, out var ts))
            {
                // Convert to PM if it's too early (e.g. 2:00 -> 14:00)
                if (ts.Hours >= 1 && ts.Hours <= 6) ts = ts.Add(TimeSpan.FromHours(12));
                return ts;
            }
            return TimeSpan.Zero;
        }

        public async Task<List<SessionDetailResponseDto>> BatchUpdateStaffAsync(Guid organizationId, BatchUpdateStaffRequestDto request)
        {
            if (request.SessionIds == null || !request.SessionIds.Any())
                throw new BadRequestException("Phải cung cấp danh sách ca học.");

            var repo = _unitOfWork.Repository<Session>();
            var sessionsResult = await repo.FindAsync(s => s.OrganizationId == organizationId && request.SessionIds.Contains(s.Id), includeProperties: "SessionAssistants");
            var sessions = sessionsResult.ToList();
            
            var updatedSessions = new List<SessionDetailResponseDto>();

            foreach (var session in sessions)
            {
                var assistantIds = new List<Guid>();
                if (request.AssistantId.HasValue) assistantIds.Add(request.AssistantId.Value);
                else assistantIds = session.SessionAssistants.Select(sa => sa.AssistantId).ToList();

                var teacherId = request.TeacherId ?? session.TeacherId;

                await CheckConflictAsync(organizationId, teacherId, assistantIds, session.SessionDate, session.StartTime, session.EndTime, session.Id);

                if (request.TeacherId.HasValue)
                {
                    session.TeacherId = request.TeacherId;
                }

                if (request.AssistantId.HasValue)
                {
                    session.SessionAssistants.Clear();
                    session.SessionAssistants.Add(new SessionAssistant { AssistantId = request.AssistantId.Value });
                    session.AssistantId = request.AssistantId;
                }

                repo.Update(session);
                updatedSessions.Add(session.ToDetailResponseDto());
            }

            await _unitOfWork.CommitAsync();

            return updatedSessions;
        }

        public async Task<List<TenantCustomFieldDto>> GetSessionCustomFieldsAsync(Guid organizationId)
        {
            var repo = _unitOfWork.Repository<TenantCustomField>();
            var fieldsResult = await repo.FindAsync(f => f.OrganizationId == organizationId && f.EntityName == "Session");
            var fields = fieldsResult.OrderBy(f => f.OrderIndex).ToList();
            
            return fields.Select(f => new TenantCustomFieldDto
            {
                Id = f.Id,
                EntityName = f.EntityName,
                FieldName = f.FieldName,
                FieldType = f.FieldType,
                IsRequired = f.IsRequired,
                OrderIndex = f.OrderIndex
            }).ToList();
        }
    }
}
