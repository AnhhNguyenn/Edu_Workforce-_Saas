using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduOps.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTwoFactorColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TwoFactorCode",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TwoFactorCodeExpiryTime",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TwoFactorEnabled",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Users",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "UserDetails",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "SystemSettings",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "SubscriptionPlans",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "SubscriptionPlanDetails",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Subjects",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "StudentSessionAttendances",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Students",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "StudentDetails",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "SessionStatuses",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Sessions",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "SessionDetails",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Schools",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "SchoolDetails",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Roles",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "RolePermissions",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "ReportStatuses",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Reports",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "ReportMedia",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "ReportDetails",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "PromotionTypes",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Promotions",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Permissions",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Organizations",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "OrganizationDetails",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "NotificationTypes",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Notifications",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Grades",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Genders",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Files",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "EnrollmentStatuses",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "ClassSchedules",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Classes",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "ClassEnrollments",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "ClassDetails",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "BillingTransactions",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "BillingStatuses",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "AuditLogs",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "AttendanceStatuses",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Attendances",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "AccountStatuses",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TwoFactorCode",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TwoFactorCodeExpiryTime",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TwoFactorEnabled",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "UserDetails");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "SubscriptionPlanDetails");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "StudentSessionAttendances");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "StudentDetails");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "SessionStatuses");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Sessions");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "SessionDetails");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "SchoolDetails");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "RolePermissions");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "ReportStatuses");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "ReportMedia");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "ReportDetails");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "PromotionTypes");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Promotions");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Permissions");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "OrganizationDetails");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "NotificationTypes");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Grades");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Genders");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "EnrollmentStatuses");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "ClassSchedules");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "ClassEnrollments");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "ClassDetails");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "BillingTransactions");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "BillingStatuses");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "AttendanceStatuses");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "AccountStatuses");
        }
    }
}
