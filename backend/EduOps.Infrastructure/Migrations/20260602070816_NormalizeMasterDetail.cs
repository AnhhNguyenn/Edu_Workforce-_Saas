using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduOps.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeMasterDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Organizations_Email",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BirthDate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "StudentSessionAttendances");

            migrationBuilder.DropColumn(
                name: "BirthDate",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ParentEmail",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ParentName",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ParentPhone",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "LessonContent",
                table: "Sessions");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "Sessions");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Sessions");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "AttendanceRadius",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "EarlyCheckoutMinutes",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "LateThresholdMinutes",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "AssistantNote",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "FeedbackForAssistant",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "FeedbackForTeacher",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "LessonTaught",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "Progress",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "RatingForAssistant",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "RatingForTeacher",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "SpecialStudents",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "TeacherComment",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Promotions");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Promotions");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "CurrentUsers",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "MaxUsers",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ClassSchedules");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "Grade",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "Subject",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ClassEnrollments");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "BillingTransactions");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Attendances");

            migrationBuilder.AddColumn<Guid>(
                name: "RoleId",
                table: "Users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusId",
                table: "Users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusId",
                table: "SubscriptionPlans",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusId",
                table: "StudentSessionAttendances",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusId",
                table: "Students",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusId",
                table: "Sessions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusId",
                table: "Reports",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusId",
                table: "Promotions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TypeId",
                table: "Promotions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CurrentPlanId",
                table: "Organizations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusId",
                table: "Organizations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TypeId",
                table: "Notifications",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusId",
                table: "ClassSchedules",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "GradeId",
                table: "Classes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusId",
                table: "Classes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SubjectId",
                table: "Classes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusId",
                table: "ClassEnrollments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusId",
                table: "BillingTransactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusId",
                table: "Attendances",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AccountStatuses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceStatuses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BillingStatuses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ClassDetails",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClassId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassDetails_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EnrollmentStatuses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnrollmentStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Genders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Genders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Grades",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Grades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotificationTypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OrganizationDetails",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationDetails_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Module = table.Column<string>(type: "text", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PromotionTypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromotionTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReportDetails",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReportId = table.Column<Guid>(type: "uuid", nullable: false),
                    LessonTaught = table.Column<string>(type: "text", nullable: true),
                    Progress = table.Column<string>(type: "text", nullable: true),
                    TeacherComment = table.Column<string>(type: "text", nullable: true),
                    AssistantNote = table.Column<string>(type: "text", nullable: true),
                    SpecialStudents = table.Column<string>(type: "text", nullable: true),
                    RatingForAssistant = table.Column<int>(type: "integer", nullable: true),
                    FeedbackForAssistant = table.Column<string>(type: "text", nullable: true),
                    RatingForTeacher = table.Column<int>(type: "integer", nullable: true),
                    FeedbackForTeacher = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportDetails_Reports_ReportId",
                        column: x => x.ReportId,
                        principalTable: "Reports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReportStatuses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SchoolDetails",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SchoolId = table.Column<Guid>(type: "uuid", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: true),
                    Latitude = table.Column<decimal>(type: "numeric", nullable: true),
                    Longitude = table.Column<decimal>(type: "numeric", nullable: true),
                    AttendanceRadius = table.Column<int>(type: "integer", nullable: false),
                    LateThresholdMinutes = table.Column<int>(type: "integer", nullable: false),
                    EarlyCheckoutMinutes = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchoolDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SchoolDetails_Schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "Schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SessionDetails",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    LessonContent = table.Column<string>(type: "text", nullable: true),
                    Note = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SessionDetails_Sessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "Sessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SessionStatuses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StudentDetails",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    BirthDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ParentName = table.Column<string>(type: "text", nullable: true),
                    ParentPhone = table.Column<string>(type: "text", nullable: true),
                    ParentEmail = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentDetails_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Subjects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subjects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionPlanDetails",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SubscriptionPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionPlanDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubscriptionPlanDetails_SubscriptionPlans_SubscriptionPlanId",
                        column: x => x.SubscriptionPlanId,
                        principalTable: "SubscriptionPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserDetails",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AvatarUrl = table.Column<string>(type: "text", nullable: true),
                    GenderId = table.Column<Guid>(type: "uuid", nullable: true),
                    BirthDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserDetails_Genders_GenderId",
                        column: x => x.GenderId,
                        principalTable: "Genders",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserDetails_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_StatusId",
                table: "Users",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPlans_StatusId",
                table: "SubscriptionPlans",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSessionAttendances_StatusId",
                table: "StudentSessionAttendances",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSessionAttendances_StudentId",
                table: "StudentSessionAttendances",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Students_StatusId",
                table: "Students",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_ClassId",
                table: "Sessions",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_StatusId",
                table: "Sessions",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_StatusId",
                table: "Reports",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Promotions_StatusId",
                table: "Promotions",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Promotions_TypeId",
                table: "Promotions",
                column: "TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_CurrentPlanId",
                table: "Organizations",
                column: "CurrentPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_StatusId",
                table: "Organizations",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TypeId",
                table: "Notifications",
                column: "TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSchedules_ClassId",
                table: "ClassSchedules",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSchedules_StatusId",
                table: "ClassSchedules",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_GradeId",
                table: "Classes",
                column: "GradeId");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_StatusId",
                table: "Classes",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_SubjectId",
                table: "Classes",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassEnrollments_ClassId",
                table: "ClassEnrollments",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassEnrollments_StatusId",
                table: "ClassEnrollments",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassEnrollments_StudentId",
                table: "ClassEnrollments",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_BillingTransactions_StatusId",
                table: "BillingTransactions",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_StatusId",
                table: "Attendances",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassDetails_ClassId",
                table: "ClassDetails",
                column: "ClassId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationDetails_Email",
                table: "OrganizationDetails",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationDetails_OrganizationId",
                table: "OrganizationDetails",
                column: "OrganizationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportDetails_ReportId",
                table: "ReportDetails",
                column: "ReportId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId",
                table: "RolePermissions",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_SchoolDetails_SchoolId",
                table: "SchoolDetails",
                column: "SchoolId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SessionDetails_SessionId",
                table: "SessionDetails",
                column: "SessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentDetails_StudentId",
                table: "StudentDetails",
                column: "StudentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPlanDetails_SubscriptionPlanId",
                table: "SubscriptionPlanDetails",
                column: "SubscriptionPlanId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserDetails_GenderId",
                table: "UserDetails",
                column: "GenderId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDetails_UserId",
                table: "UserDetails",
                column: "UserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Attendances_AttendanceStatuses_StatusId",
                table: "Attendances",
                column: "StatusId",
                principalTable: "AttendanceStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BillingTransactions_BillingStatuses_StatusId",
                table: "BillingTransactions",
                column: "StatusId",
                principalTable: "BillingStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ClassEnrollments_Classes_ClassId",
                table: "ClassEnrollments",
                column: "ClassId",
                principalTable: "Classes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ClassEnrollments_EnrollmentStatuses_StatusId",
                table: "ClassEnrollments",
                column: "StatusId",
                principalTable: "EnrollmentStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ClassEnrollments_Students_StudentId",
                table: "ClassEnrollments",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_AccountStatuses_StatusId",
                table: "Classes",
                column: "StatusId",
                principalTable: "AccountStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_Grades_GradeId",
                table: "Classes",
                column: "GradeId",
                principalTable: "Grades",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_Schools_SchoolId",
                table: "Classes",
                column: "SchoolId",
                principalTable: "Schools",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_Subjects_SubjectId",
                table: "Classes",
                column: "SubjectId",
                principalTable: "Subjects",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ClassSchedules_AccountStatuses_StatusId",
                table: "ClassSchedules",
                column: "StatusId",
                principalTable: "AccountStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ClassSchedules_Classes_ClassId",
                table: "ClassSchedules",
                column: "ClassId",
                principalTable: "Classes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_NotificationTypes_TypeId",
                table: "Notifications",
                column: "TypeId",
                principalTable: "NotificationTypes",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Organizations_AccountStatuses_StatusId",
                table: "Organizations",
                column: "StatusId",
                principalTable: "AccountStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Organizations_SubscriptionPlans_CurrentPlanId",
                table: "Organizations",
                column: "CurrentPlanId",
                principalTable: "SubscriptionPlans",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Promotions_AccountStatuses_StatusId",
                table: "Promotions",
                column: "StatusId",
                principalTable: "AccountStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Promotions_PromotionTypes_TypeId",
                table: "Promotions",
                column: "TypeId",
                principalTable: "PromotionTypes",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_ReportStatuses_StatusId",
                table: "Reports",
                column: "StatusId",
                principalTable: "ReportStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Schools_Organizations_OrganizationId",
                table: "Schools",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Sessions_Classes_ClassId",
                table: "Sessions",
                column: "ClassId",
                principalTable: "Classes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Sessions_SessionStatuses_StatusId",
                table: "Sessions",
                column: "StatusId",
                principalTable: "SessionStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Students_AccountStatuses_StatusId",
                table: "Students",
                column: "StatusId",
                principalTable: "AccountStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentSessionAttendances_AttendanceStatuses_StatusId",
                table: "StudentSessionAttendances",
                column: "StatusId",
                principalTable: "AttendanceStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentSessionAttendances_Students_StudentId",
                table: "StudentSessionAttendances",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SubscriptionPlans_AccountStatuses_StatusId",
                table: "SubscriptionPlans",
                column: "StatusId",
                principalTable: "AccountStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_AccountStatuses_StatusId",
                table: "Users",
                column: "StatusId",
                principalTable: "AccountStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Organizations_OrganizationId",
                table: "Users",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Roles_RoleId",
                table: "Users",
                column: "RoleId",
                principalTable: "Roles",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendances_AttendanceStatuses_StatusId",
                table: "Attendances");

            migrationBuilder.DropForeignKey(
                name: "FK_BillingTransactions_BillingStatuses_StatusId",
                table: "BillingTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_ClassEnrollments_Classes_ClassId",
                table: "ClassEnrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_ClassEnrollments_EnrollmentStatuses_StatusId",
                table: "ClassEnrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_ClassEnrollments_Students_StudentId",
                table: "ClassEnrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Classes_AccountStatuses_StatusId",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_Classes_Grades_GradeId",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_Classes_Schools_SchoolId",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_Classes_Subjects_SubjectId",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_ClassSchedules_AccountStatuses_StatusId",
                table: "ClassSchedules");

            migrationBuilder.DropForeignKey(
                name: "FK_ClassSchedules_Classes_ClassId",
                table: "ClassSchedules");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_NotificationTypes_TypeId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Organizations_AccountStatuses_StatusId",
                table: "Organizations");

            migrationBuilder.DropForeignKey(
                name: "FK_Organizations_SubscriptionPlans_CurrentPlanId",
                table: "Organizations");

            migrationBuilder.DropForeignKey(
                name: "FK_Promotions_AccountStatuses_StatusId",
                table: "Promotions");

            migrationBuilder.DropForeignKey(
                name: "FK_Promotions_PromotionTypes_TypeId",
                table: "Promotions");

            migrationBuilder.DropForeignKey(
                name: "FK_Reports_ReportStatuses_StatusId",
                table: "Reports");

            migrationBuilder.DropForeignKey(
                name: "FK_Schools_Organizations_OrganizationId",
                table: "Schools");

            migrationBuilder.DropForeignKey(
                name: "FK_Sessions_Classes_ClassId",
                table: "Sessions");

            migrationBuilder.DropForeignKey(
                name: "FK_Sessions_SessionStatuses_StatusId",
                table: "Sessions");

            migrationBuilder.DropForeignKey(
                name: "FK_Students_AccountStatuses_StatusId",
                table: "Students");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentSessionAttendances_AttendanceStatuses_StatusId",
                table: "StudentSessionAttendances");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentSessionAttendances_Students_StudentId",
                table: "StudentSessionAttendances");

            migrationBuilder.DropForeignKey(
                name: "FK_SubscriptionPlans_AccountStatuses_StatusId",
                table: "SubscriptionPlans");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_AccountStatuses_StatusId",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Organizations_OrganizationId",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Roles_RoleId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "AccountStatuses");

            migrationBuilder.DropTable(
                name: "AttendanceStatuses");

            migrationBuilder.DropTable(
                name: "BillingStatuses");

            migrationBuilder.DropTable(
                name: "ClassDetails");

            migrationBuilder.DropTable(
                name: "EnrollmentStatuses");

            migrationBuilder.DropTable(
                name: "Grades");

            migrationBuilder.DropTable(
                name: "NotificationTypes");

            migrationBuilder.DropTable(
                name: "OrganizationDetails");

            migrationBuilder.DropTable(
                name: "PromotionTypes");

            migrationBuilder.DropTable(
                name: "ReportDetails");

            migrationBuilder.DropTable(
                name: "ReportStatuses");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "SchoolDetails");

            migrationBuilder.DropTable(
                name: "SessionDetails");

            migrationBuilder.DropTable(
                name: "SessionStatuses");

            migrationBuilder.DropTable(
                name: "StudentDetails");

            migrationBuilder.DropTable(
                name: "Subjects");

            migrationBuilder.DropTable(
                name: "SubscriptionPlanDetails");

            migrationBuilder.DropTable(
                name: "UserDetails");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Genders");

            migrationBuilder.DropIndex(
                name: "IX_Users_RoleId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_StatusId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_SubscriptionPlans_StatusId",
                table: "SubscriptionPlans");

            migrationBuilder.DropIndex(
                name: "IX_StudentSessionAttendances_StatusId",
                table: "StudentSessionAttendances");

            migrationBuilder.DropIndex(
                name: "IX_StudentSessionAttendances_StudentId",
                table: "StudentSessionAttendances");

            migrationBuilder.DropIndex(
                name: "IX_Students_StatusId",
                table: "Students");

            migrationBuilder.DropIndex(
                name: "IX_Sessions_ClassId",
                table: "Sessions");

            migrationBuilder.DropIndex(
                name: "IX_Sessions_StatusId",
                table: "Sessions");

            migrationBuilder.DropIndex(
                name: "IX_Reports_StatusId",
                table: "Reports");

            migrationBuilder.DropIndex(
                name: "IX_Promotions_StatusId",
                table: "Promotions");

            migrationBuilder.DropIndex(
                name: "IX_Promotions_TypeId",
                table: "Promotions");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_CurrentPlanId",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_StatusId",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_TypeId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_ClassSchedules_ClassId",
                table: "ClassSchedules");

            migrationBuilder.DropIndex(
                name: "IX_ClassSchedules_StatusId",
                table: "ClassSchedules");

            migrationBuilder.DropIndex(
                name: "IX_Classes_GradeId",
                table: "Classes");

            migrationBuilder.DropIndex(
                name: "IX_Classes_StatusId",
                table: "Classes");

            migrationBuilder.DropIndex(
                name: "IX_Classes_SubjectId",
                table: "Classes");

            migrationBuilder.DropIndex(
                name: "IX_ClassEnrollments_ClassId",
                table: "ClassEnrollments");

            migrationBuilder.DropIndex(
                name: "IX_ClassEnrollments_StatusId",
                table: "ClassEnrollments");

            migrationBuilder.DropIndex(
                name: "IX_ClassEnrollments_StudentId",
                table: "ClassEnrollments");

            migrationBuilder.DropIndex(
                name: "IX_BillingTransactions_StatusId",
                table: "BillingTransactions");

            migrationBuilder.DropIndex(
                name: "IX_Attendances_StatusId",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "RoleId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "StudentSessionAttendances");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "Sessions");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "Promotions");

            migrationBuilder.DropColumn(
                name: "TypeId",
                table: "Promotions");

            migrationBuilder.DropColumn(
                name: "CurrentPlanId",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "TypeId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "ClassSchedules");

            migrationBuilder.DropColumn(
                name: "GradeId",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "SubjectId",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "ClassEnrollments");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "BillingTransactions");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "Attendances");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "BirthDate",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "SubscriptionPlans",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "SubscriptionPlans",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "StudentSessionAttendances",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "BirthDate",
                table: "Students",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentEmail",
                table: "Students",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ParentName",
                table: "Students",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ParentPhone",
                table: "Students",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Students",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LessonContent",
                table: "Sessions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Sessions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Sessions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Schools",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AttendanceRadius",
                table: "Schools",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EarlyCheckoutMinutes",
                table: "Schools",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LateThresholdMinutes",
                table: "Schools",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "Latitude",
                table: "Schools",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Longitude",
                table: "Schools",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AssistantNote",
                table: "Reports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FeedbackForAssistant",
                table: "Reports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FeedbackForTeacher",
                table: "Reports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LessonTaught",
                table: "Reports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Progress",
                table: "Reports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RatingForAssistant",
                table: "Reports",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RatingForTeacher",
                table: "Reports",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SpecialStudents",
                table: "Reports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Reports",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TeacherComment",
                table: "Reports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Promotions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Promotions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Organizations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CurrentUsers",
                table: "Organizations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "MaxUsers",
                table: "Organizations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Notifications",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "ClassSchedules",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Classes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "Classes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Classes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Subject",
                table: "Classes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "ClassEnrollments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "BillingTransactions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Attendances",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_Email",
                table: "Organizations",
                column: "Email",
                unique: true);
        }
    }
}
