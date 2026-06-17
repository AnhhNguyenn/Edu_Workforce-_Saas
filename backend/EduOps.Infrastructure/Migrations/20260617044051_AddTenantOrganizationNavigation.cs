using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduOps.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantOrganizationNavigation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Users_FullName",
                table: "Users",
                column: "FullName");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Phone",
                table: "Users",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPlans_Name",
                table: "SubscriptionPlans",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_Code",
                table: "Subjects",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_Name",
                table: "Subjects",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_OrganizationId",
                table: "Subjects",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSessionAttendances_OrganizationId",
                table: "StudentSessionAttendances",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Students_FullName",
                table: "Students",
                column: "FullName");

            migrationBuilder.CreateIndex(
                name: "IX_Students_OrganizationId",
                table: "Students",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Students_StudentCode",
                table: "Students",
                column: "StudentCode");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_OrganizationId",
                table: "Sessions",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Schools_Name",
                table: "Schools",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Code",
                table: "Roles",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_OrganizationId",
                table: "Roles",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_OrganizationId",
                table: "Reports",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Promotions_Code",
                table: "Promotions",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_Name",
                table: "Organizations",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_OrganizationId",
                table: "Notifications",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Grades_OrganizationId",
                table: "Grades",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Files_OrganizationId",
                table: "Files",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSchedules_OrganizationId",
                table: "ClassSchedules",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_Name",
                table: "Classes",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_OrganizationId",
                table: "Classes",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassEnrollments_OrganizationId",
                table: "ClassEnrollments",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_BillingTransactions_OrganizationId",
                table: "BillingTransactions",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_OrganizationId",
                table: "AuditLogs",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_OrganizationId",
                table: "Attendances",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendances_Organizations_OrganizationId",
                table: "Attendances",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_Organizations_OrganizationId",
                table: "AuditLogs",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BillingTransactions_Organizations_OrganizationId",
                table: "BillingTransactions",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ClassEnrollments_Organizations_OrganizationId",
                table: "ClassEnrollments",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_Organizations_OrganizationId",
                table: "Classes",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ClassSchedules_Organizations_OrganizationId",
                table: "ClassSchedules",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Files_Organizations_OrganizationId",
                table: "Files",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Grades_Organizations_OrganizationId",
                table: "Grades",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Organizations_OrganizationId",
                table: "Notifications",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_Organizations_OrganizationId",
                table: "Reports",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Roles_Organizations_OrganizationId",
                table: "Roles",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Sessions_Organizations_OrganizationId",
                table: "Sessions",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Students_Organizations_OrganizationId",
                table: "Students",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentSessionAttendances_Organizations_OrganizationId",
                table: "StudentSessionAttendances",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Subjects_Organizations_OrganizationId",
                table: "Subjects",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendances_Organizations_OrganizationId",
                table: "Attendances");

            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_Organizations_OrganizationId",
                table: "AuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_BillingTransactions_Organizations_OrganizationId",
                table: "BillingTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_ClassEnrollments_Organizations_OrganizationId",
                table: "ClassEnrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Classes_Organizations_OrganizationId",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_ClassSchedules_Organizations_OrganizationId",
                table: "ClassSchedules");

            migrationBuilder.DropForeignKey(
                name: "FK_Files_Organizations_OrganizationId",
                table: "Files");

            migrationBuilder.DropForeignKey(
                name: "FK_Grades_Organizations_OrganizationId",
                table: "Grades");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Organizations_OrganizationId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Organizations_OrganizationId",
                table: "Reports");

            migrationBuilder.DropForeignKey(
                name: "FK_Roles_Organizations_OrganizationId",
                table: "Roles");

            migrationBuilder.DropForeignKey(
                name: "FK_Sessions_Organizations_OrganizationId",
                table: "Sessions");

            migrationBuilder.DropForeignKey(
                name: "FK_Students_Organizations_OrganizationId",
                table: "Students");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentSessionAttendances_Organizations_OrganizationId",
                table: "StudentSessionAttendances");

            migrationBuilder.DropForeignKey(
                name: "FK_Subjects_Organizations_OrganizationId",
                table: "Subjects");

            migrationBuilder.DropIndex(
                name: "IX_Users_FullName",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Phone",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_SubscriptionPlans_Name",
                table: "SubscriptionPlans");

            migrationBuilder.DropIndex(
                name: "IX_Subjects_Code",
                table: "Subjects");

            migrationBuilder.DropIndex(
                name: "IX_Subjects_Name",
                table: "Subjects");

            migrationBuilder.DropIndex(
                name: "IX_Subjects_OrganizationId",
                table: "Subjects");

            migrationBuilder.DropIndex(
                name: "IX_StudentSessionAttendances_OrganizationId",
                table: "StudentSessionAttendances");

            migrationBuilder.DropIndex(
                name: "IX_Students_FullName",
                table: "Students");

            migrationBuilder.DropIndex(
                name: "IX_Students_OrganizationId",
                table: "Students");

            migrationBuilder.DropIndex(
                name: "IX_Students_StudentCode",
                table: "Students");

            migrationBuilder.DropIndex(
                name: "IX_Sessions_OrganizationId",
                table: "Sessions");

            migrationBuilder.DropIndex(
                name: "IX_Schools_Name",
                table: "Schools");

            migrationBuilder.DropIndex(
                name: "IX_Roles_Code",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_Roles_Name",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_Roles_OrganizationId",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_Reports_OrganizationId",
                table: "Reports");

            migrationBuilder.DropIndex(
                name: "IX_Promotions_Code",
                table: "Promotions");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_Name",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_OrganizationId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Grades_OrganizationId",
                table: "Grades");

            migrationBuilder.DropIndex(
                name: "IX_Files_OrganizationId",
                table: "Files");

            migrationBuilder.DropIndex(
                name: "IX_ClassSchedules_OrganizationId",
                table: "ClassSchedules");

            migrationBuilder.DropIndex(
                name: "IX_Classes_Name",
                table: "Classes");

            migrationBuilder.DropIndex(
                name: "IX_Classes_OrganizationId",
                table: "Classes");

            migrationBuilder.DropIndex(
                name: "IX_ClassEnrollments_OrganizationId",
                table: "ClassEnrollments");

            migrationBuilder.DropIndex(
                name: "IX_BillingTransactions_OrganizationId",
                table: "BillingTransactions");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_OrganizationId",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_Attendances_OrganizationId",
                table: "Attendances");
        }
    }
}
